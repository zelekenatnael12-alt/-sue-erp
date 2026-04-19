const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { generateAiInsights } = require('./ai');

const prisma = new PrismaClient();
const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sue-ethiopia-secret-2024';

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('/{*path}', cors());       // handle pre-flight for all routes
app.use(express.json());

// ─── Multer ───────────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function makeToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name, 
      region: user.region,
      subRegion: user.subRegion,
      area: user.area 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(user) {
  return { 
    id: user.id, 
    email: user.email, 
    name: user.name, 
    role: user.role, 
    region: user.region,
    subRegion: user.subRegion,
    area: user.area,
    mustChangePassword: user.mustChangePassword ?? false,
  };
}


function getGeographyWhere(user) {
  if (user.role === 'EXECUTIVE' || user.role === 'ADMIN') return {};
  if (user.role === 'COORDINATOR') return { coordinator: { region: user.region } };
  if (user.role === 'SUB_REGIONAL') return { coordinator: { subRegion: user.subRegion } };
  if (user.role === 'AREA_STAFF') return { coordinatorId: user.id };
  return { coordinatorId: user.id };
}

// ─── Auth: Unified Register ───────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, region, subRegion, area, accessCode } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const targetRole = role || 'AREA_STAFF';
    const allowedPublicRoles = ['AREA_STAFF', 'SUB_REGIONAL', 'COORDINATOR'];

    let finalPasswordHashLength = 10;

    if (targetRole === 'EXECUTIVE') {
      const EXEC_CODE = process.env.EXECUTIVE_CODE || 'SUE-EXEC-2024';
      if (accessCode !== EXEC_CODE) return res.status(403).json({ error: 'Invalid executive access code' });
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      finalPasswordHashLength = 12;
    } else if (targetRole === 'ADMIN') {
      const ADMIN_CODE = process.env.ADMIN_CODE || 'SUE-ADMIN-2024';
      if (accessCode !== ADMIN_CODE) return res.status(403).json({ error: 'Invalid admin access code' });
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      finalPasswordHashLength = 12;
    } else {
      if (!allowedPublicRoles.includes(targetRole)) {
        return res.status(400).json({ error: 'Invalid role for registration' });
      }
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, finalPasswordHashLength);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        role: targetRole,
        region: targetRole !== 'EXECUTIVE' && targetRole !== 'ADMIN' ? region || null : null,
        subRegion: targetRole !== 'EXECUTIVE' && targetRole !== 'ADMIN' ? subRegion || null : null,
        area: targetRole !== 'EXECUTIVE' && targetRole !== 'ADMIN' ? area || null : null,
        passwordHash,
      },
    });

    res.status(201).json({ token: makeToken(user), user: safeUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// ─── Auth: Unified Login ──────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ token: makeToken(user), user: safeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// ─── Auth: Change Password (first-login forced reset) ────────────────────────
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false },
    });

    res.json({ token: makeToken(updated), user: safeUser(updated) });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ─── Auth: Get Profile ────────────────────────────────────────────────────────

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, region: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─── File Upload ──────────────────────────────────────────────────────────────
app.post('/api/upload', authenticateToken, upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, path: `/uploads/${req.file.filename}` });
});

// ─── Plan Routes ──────────────────────────────────────────────────────────────
app.post('/api/plan/draft', authenticateToken, async (req, res) => {
  try {
    const { 
      id, projectName, projectType, description, orgStructure, leadRoles, 
      totalStaff, totalHighSchools, suFellowshipSchools, fellowshipNotSuSchools, noFellowshipSchools, middleSchools,
      fullTimeStaffCount, associateStaffCount, volunteerCount, matrixActivities 
    } = req.body;

    if (!projectName) return res.status(400).json({ error: 'projectName is required' });

    let plan;
    if (id) {
      plan = await prisma.projectPlan.update({
        where: { id: parseInt(id) },
        data: { 
          projectName, projectType, description, orgStructure, leadRoles, totalStaff, 
          totalHighSchools, suFellowshipSchools, fellowshipNotSuSchools, noFellowshipSchools, middleSchools,
          fullTimeStaffCount, associateStaffCount, volunteerCount,
          status: 'DRAFT',
          matrixActivities: {
            deleteMany: {}, // Clear old matrix rows to overwrite
            create: matrixActivities || []
          }
        },
        include: { matrixActivities: true }
      });
    } else {
      plan = await prisma.projectPlan.create({
        data: {
          projectName, projectType, description, orgStructure, leadRoles, totalStaff,
          totalHighSchools, suFellowshipSchools, fellowshipNotSuSchools, noFellowshipSchools, middleSchools,
          fullTimeStaffCount, associateStaffCount, volunteerCount,
          coordinatorId: req.user.id,
          status: 'DRAFT',
          matrixActivities: {
            create: matrixActivities || []
          }
        },
        include: { matrixActivities: true }
      });
    }
    res.json(plan);
  } catch (error) {
    console.error('Draft error:', error);
    res.status(500).json({ error: 'Failed to save draft: ' + error.message });
  }
});

app.get('/api/plan/draft/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await prisma.projectPlan.findUnique({ 
      where: { id: parseInt(req.params.id) },
      include: { matrixActivities: true }
    });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

app.get('/api/plan/my', authenticateToken, async (req, res) => {
  try {
    const where = getGeographyWhere(req.user);
    const plans = await prisma.projectPlan.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { coordinator: { select: { name: true, region: true, subRegion: true, area: true } } }
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

app.post('/api/plan/submit', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ error: 'planId required' });

    const plan = await prisma.projectPlan.update({
      where: { id: parseInt(planId) },
      data: { status: 'SUBMITTED' },
    });

    const report = await prisma.report.create({
      data: {
        title: `Report for ${plan.projectName}`,
        coordinatorId: plan.coordinatorId,
        projectPlanId: plan.id,
        status: 'PENDING_REVIEW',
      },
    });

    res.json({ plan, report });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit: ' + error.message });
  }
});

// ─── Report Routes ────────────────────────────────────────────────────────────
app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    const where = getGeographyWhere(req.user);
    const reports = await prisma.report.findMany({
      where,
      include: {
        coordinator: { select: { id: true, name: true, email: true, region: true, subRegion: true, area: true } },
        projectPlan: { select: { id: true, projectName: true, projectType: true, status: true, totalStaff: true } },
      },
      orderBy: { dateSubmitted: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.get('/api/reports/:id', authenticateToken, async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        coordinator: { select: { id: true, name: true, email: true, region: true } },
        projectPlan: {
          include: { reports: true }
        },
      },
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

app.post('/api/monthly-report', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'COORDINATOR') {
      return res.status(403).json({ error: 'Only coordinators can submit monthly reports' });
    }
    const { planId, reportMonth, reportYear, budgetSpent, narrative, actualsMatrix } = req.body;
    
    const plan = await prisma.projectPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.coordinatorId !== req.user.id) {
       return res.status(404).json({ error: 'Plan not found or unauthorized' });
    }
    if (plan.status !== 'APPROVED') {
       return res.status(400).json({ error: 'Monthly reports can only be added to an APPROVED plan' });
    }

    const report = await prisma.report.create({
      data: {
        title: `Monthly Update (${reportMonth} ${reportYear}) - ${plan.projectName}`,
        type: 'MONTHLY_UPDATE',
        reportMonth,
        reportYear: parseInt(reportYear),
        budgetSpent: parseFloat(budgetSpent),
        narrative,
        actualsMatrix: actualsMatrix ? JSON.stringify(actualsMatrix) : null,
        status: 'PENDING_REVIEW',
        coordinatorId: req.user.id,
        projectPlanId: planId
      }
    });
    res.status(201).json(report);
  } catch (error) {
    console.error('Failed to submit monthly report', error);
    res.status(500).json({ error: 'Failed to submit monthly report' });
  }
});

app.patch('/api/reports/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'EXECUTIVE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    const report = await prisma.report.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'APPROVED' },
    });
    
    if (report.type === 'PLAN_APPROVAL') {
      await prisma.projectPlan.update({
        where: { id: report.projectPlanId },
        data: { status: 'APPROVED' }
      });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve report' });
  }
});

app.patch('/api/reports/:id/reject', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'EXECUTIVE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    const report = await prisma.report.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'REJECTED' },
    });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject report' });
  }
});

// ─── Analytics Route ────────────────────────────────────────────────────────
app.get('/api/admin/analytics', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'EXECUTIVE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const approvedPlans = await prisma.projectPlan.findMany({
      where: { status: 'APPROVED' },
      include: {
         matrixActivities: true,
         reports: {
           where: { type: 'MONTHLY_UPDATE', status: 'APPROVED' }
         }
      }
    });

    let baselines = {
       totalHighSchools: 0, suFellowshipSchools: 0, fellowshipNotSuSchools: 0, noFellowshipSchools: 0, middleSchools: 0,
       fullTimeStaffCount: 0, associateStaffCount: 0, volunteerCount: 0
    };

    let allTargets = [];
    let globalActuals = {};

    for (const plan of approvedPlans) {
       baselines.totalHighSchools += plan.totalHighSchools || 0;
       baselines.suFellowshipSchools += plan.suFellowshipSchools || 0;
       baselines.fellowshipNotSuSchools += plan.fellowshipNotSuSchools || 0;
       baselines.noFellowshipSchools += plan.noFellowshipSchools || 0;
       baselines.middleSchools += plan.middleSchools || 0;

       baselines.fullTimeStaffCount += plan.fullTimeStaffCount || 0;
       baselines.associateStaffCount += plan.associateStaffCount || 0;
       baselines.volunteerCount += plan.volunteerCount || 0;

       allTargets.push(...plan.matrixActivities);

       for (const rep of plan.reports) {
         if (rep.actualsMatrix) {
            try { 
              const actuals = JSON.parse(rep.actualsMatrix); 
              for (const [actId, val] of Object.entries(actuals)) {
                 if (!globalActuals[actId]) globalActuals[actId] = 0;
                 globalActuals[actId] += (Number(val) || 0);
              }
            } catch(e) {}
         }
       }
    }

    res.json({
       baselines,
       allTargets,
       globalActuals,
       totalApprovedPlans: approvedPlans.length
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ─── AI Insights Route ──────────────────────────────────────────────────────
app.get('/api/analytics/ai-insights', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'EXECUTIVE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    const insights = await generateAiInsights();
    res.json(insights);
  } catch (error) {
    console.error('AI Insights error:', error);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const where = getGeographyWhere(req.user);

    const totalReports = await prisma.report.count({ where });
    const pendingReports = await prisma.report.count({ where: { ...where, status: 'PENDING_REVIEW' } });
    const approvedReports = await prisma.report.count({ where: { ...where, status: 'APPROVED' } });
    const totalUsers = await prisma.user.count();

    const recentReports = await prisma.report.findMany({
      where,
      include: {
        coordinator: { select: { name: true, region: true, subRegion: true, area: true } },
      },
      orderBy: { dateSubmitted: 'desc' },
      take: 5,
    });

    // Calculate total budget requested from all submitted/approved plans
    const allTasks = await prisma.officeTask.findMany({
      where: {
        projectPlan: {
          status: { in: ['SUBMITTED', 'APPROVED'] },
          ...getGeographyWhere(req.user),
        }
      },
      select: { budget: true }
    });
    const totalBudget = allTasks.reduce((acc, t) => acc + t.budget, 0);

    // Calculate regional progress based on report counts (as a proxy for now)
    const regionalData = await prisma.user.groupBy({
      by: ['region'],
      where: { role: 'COORDINATOR', region: { not: null } },
      _count: { id: true }
    });
    
    const regionalProgress = regionalData.map(r => ({
      region: r.region,
      actualPercent: Math.min(100, Math.round((r._count.id / 10) * 100)) // Placeholder logic: 10 reports = 100%
    }));

    res.json({
      totalReports, pendingReports, approvedReports, totalUsers,
      recentReports,
      totalVolunteers: { count: 12450, trend: '+5.2%' }, // Still hardcoded for now
      schoolsReached: { count: 840, trend: '+12%' },    // Still hardcoded for now
      budgetRequested: { 
        total: totalBudget > 1000000 ? (totalBudget / 1000000).toFixed(1) + 'M' : totalBudget.toLocaleString(),
        currency: 'ETB', 
        status: 'On Track' 
      },
      regionalProgress: regionalProgress.length > 0 ? regionalProgress : [
        { region: 'Addis Ababa', actualPercent: 92 },
        { region: 'Amhara', actualPercent: 78 },
        { region: 'Oromia', actualPercent: 85 },
        { region: 'Sidama', actualPercent: 64 },
        { region: 'Others', actualPercent: 45 },
      ],
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── Admin: Overview Stats ────────────────────────────────────────────────────
app.get('/api/admin/overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

    const [
      totalUsers,
      totalCoordinators,
      totalExecutives,
      totalAdmins,
      totalReports,
      pendingReports,
      approvedReports,
      totalPlans,
      draftPlans,
      submittedPlans,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'COORDINATOR' } }),
      prisma.user.count({ where: { role: 'EXECUTIVE' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.report.count({ where: { status: 'APPROVED' } }),
      prisma.projectPlan.count(),
      prisma.projectPlan.count({ where: { status: 'DRAFT' } }),
      prisma.projectPlan.count({ where: { status: 'SUBMITTED' } }),
    ]);

    const recentReports = await prisma.report.findMany({
      take: 8,
      include: {
        coordinator: { select: { id: true, name: true, email: true, region: true } },
        projectPlan: { select: { projectName: true, projectType: true } },
      },
      orderBy: { dateSubmitted: 'desc' },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, region: true, createdAt: true },
    });

    // Regional summary based on coordinator regions
    const allCoordinators = await prisma.user.findMany({
      where: { role: 'COORDINATOR' },
      select: { region: true },
    });
    const regionCounts = {};
    allCoordinators.forEach(u => {
      const r = u.region || 'Unknown';
      regionCounts[r] = (regionCounts[r] || 0) + 1;
    });
    const regionBreakdown = Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      users: { total: totalUsers, coordinators: totalCoordinators, executives: totalExecutives, admins: totalAdmins },
      reports: { total: totalReports, pending: pendingReports, approved: approvedReports },
      plans: { total: totalPlans, draft: draftPlans, submitted: submittedPlans },
      recentReports,
      recentUsers,
      regionBreakdown,
      quickStats: {
        totalVolunteers: { count: 12450, trend: '+5.2%' },
        schoolsReached: { count: 840, trend: '+12%' },
        budgetRequested: { total: '45.2M', currency: 'ETB', status: 'On Track' },
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

// ─── Admin: User Management ───────────────────────────────────────────────────
app.post('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'EXECUTIVE') return res.status(403).json({ error: 'Permission denied' });
    const { name, email, password, role, region, subRegion, area, isActive } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        name, 
        email: email.toLowerCase(), 
        passwordHash: hashedPassword, 
        role, 
        region, 
        subRegion,
        area,
        isActive: isActive ?? true 
      },
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'EXECUTIVE') return res.status(403).json({ error: 'Permission denied' });
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        region: true,
        subRegion: true,
        area: true,
        isActive: true,
        createdAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'EXECUTIVE') return res.status(403).json({ error: 'Permission denied' });
    const { name, role, region, subRegion, area, isActive, email } = req.body;
    
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        name, 
        role, 
        region, 
        subRegion,
        area,
        isActive, 
        email: email ? email.toLowerCase() : undefined 
      },
    });
    
    res.json(safeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'EXECUTIVE') return res.status(403).json({ error: 'Permission denied' });
    
    // Check if user has reports or plans before deleting (or use cascading if preferred)
    // For now, we'll allow deletion or the user can just deactivate.
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user. They may have related data.' });
  }
});

// ─── Announcements ─────────────────────────────────────────────────────────────
app.get('/api/announcements', authenticateToken, async (req, res) => {
  try {
    // Regular users only see active announcements for their role or ALL
    const where = req.user.role === 'ADMIN' ? {} : { 
      isActive: true, 
      target: { in: ['ALL', req.user.role] } 
    };
    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.post('/api/announcements', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { title, content, target, isActive } = req.body;
    const announcement = await prisma.announcement.create({
      data: { title, content, target, isActive: isActive ?? true },
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

app.patch('/api/announcements/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { title, content, target, isActive } = req.body;
    const announcement = await prisma.announcement.update({
      where: { id: parseInt(req.params.id) },
      data: { title, content, target, isActive },
    });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

app.delete('/api/announcements/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    await prisma.announcement.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// ─── Events ──────────────────────────────────────────────────────────────────
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { title, description, date, location, type, isActive } = req.body;
    const event = await prisma.event.create({
      data: { 
        title, 
        description, 
        date: new Date(date), 
        location, 
        type: type || 'GENERAL', 
        isActive: isActive ?? true 
      },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Event create error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.patch('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { title, description, date, location, type, isActive } = req.body;
    const updateData = { title, description, location, type, isActive };
    if (date) updateData.date = new Date(date);
    
    const event = await prisma.event.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    await prisma.event.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ─── Staff Management ─────────────────────────────────────────────────────────
app.get('/api/staff', authenticateToken, async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { joinedDate: 'desc' },
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

app.post('/api/staff', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { name, position, email, phone, department, joinedDate, isActive } = req.body;
    const staff = await prisma.staff.create({
      data: { 
        name, 
        position, 
        email, 
        phone, 
        department, 
        joinedDate: joinedDate ? new Date(joinedDate) : new Date(), 
        isActive: isActive ?? true 
      },
    });
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

app.patch('/api/staff/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { name, position, email, phone, department, joinedDate, isActive } = req.body;
    const updateData = { name, position, email, phone, department, isActive };
    if (joinedDate) updateData.joinedDate = new Date(joinedDate);
    
    const staff = await prisma.staff.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

app.delete('/api/staff/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    await prisma.staff.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Staff member deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

// ─── Financial Management ─────────────────────────────────────────────────────
app.get('/api/financials', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'EXECUTIVE') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    const financials = await prisma.financialRecord.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(financials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial records' });
  }
});

app.post('/api/financials', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { title, amount, type, category, date, description, projectId, reportId } = req.body;
    const record = await prisma.financialRecord.create({
      data: { 
        title, 
        amount: parseFloat(amount), 
        type: type || 'EXPENSE', 
        category, 
        date: date ? new Date(date) : new Date(), 
        description,
        projectId: projectId ? parseInt(projectId) : null,
        reportId: reportId ? parseInt(reportId) : null
      },
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create financial record' });
  }
});

app.patch('/api/financials/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { title, amount, type, category, date, description, projectId, reportId } = req.body;
    const updateData = { title, type, category, description };
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (date) updateData.date = new Date(date);
    if (projectId !== undefined) updateData.projectId = projectId ? parseInt(projectId) : null;
    if (reportId !== undefined) updateData.reportId = reportId ? parseInt(reportId) : null;
    
    const record = await prisma.financialRecord.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update financial record' });
  }
});

app.delete('/api/financials/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    await prisma.financialRecord.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Financial record deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete financial record' });
  }
});

// ─── Export Utility ──────────────────────────────────────────────────────────
app.get('/api/admin/export', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    
    const { type } = req.query;
    let data = [];
    let filename = `export_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    let csvContent = '';

    if (type === 'reports') {
      data = await prisma.report.findMany({
        include: { coordinator: true, projectPlan: true }
      });
      csvContent = 'ID,Project Name,Coordinator,Region,Status,Date Submitted\n' + 
        data.map(r => `${r.id},"${r.projectPlan?.projectName}","${r.coordinator?.name}","${r.coordinator?.region}",${r.status},${r.dateSubmitted.toISOString()}`).join('\n');
    } else if (type === 'users') {
      data = await prisma.user.findMany();
      csvContent = 'ID,Name,Email,Role,Region,Active,Joined\n' + 
        data.map(u => `${u.id},"${u.name || ''}","${u.email}",${u.role},"${u.region || ''}",${u.isActive},${u.createdAt.toISOString()}`).join('\n');
    } else if (type === 'financials') {
      data = await prisma.financialRecord.findMany({ orderBy: { date: 'desc' } });
      csvContent = 'ID,Date,Title,Type,Category,Amount,Description\n' + 
        data.map(r => `${r.id},${r.date.toISOString()},"${r.title}",${r.type},${r.category},${r.amount},"${r.description || ''}"`).join('\n');
    } else if (type === 'events') {
      data = await prisma.event.findMany({ orderBy: { date: 'asc' } });
      csvContent = 'ID,Date,Title,Type,Location,Active\n' + 
        data.map(e => `${e.id},${e.date.toISOString()},"${e.title}",${e.type},"${e.location || ''}",${e.isActive}`).join('\n');
    } else {
      return res.status(400).json({ error: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to generate export' });
  }
});

// ─── Newsletter Management ───────────────────────────────────────────────────
app.get('/api/newsletters', authenticateToken, async (req, res) => {
  try {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: { publishDate: 'desc' },
    });
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch newsletters' });
  }
});

app.post('/api/newsletters', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { title, content, author, publishDate, status } = req.body;
    const newsletter = await prisma.newsletter.create({
      data: { 
        title, 
        content, 
        author, 
        publishDate: publishDate ? new Date(publishDate) : new Date(), 
        status: status || 'DRAFT' 
      },
    });
    res.status(201).json(newsletter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create newsletter' });
  }
});

app.patch('/api/newsletters/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { title, content, author, publishDate, status } = req.body;
    const updateData = { title, content, author, status };
    if (publishDate) updateData.publishDate = new Date(publishDate);
    
    const newsletter = await prisma.newsletter.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update newsletter' });
  }
});

app.delete('/api/newsletters/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    await prisma.newsletter.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Newsletter deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete newsletter' });
  }
});

// ─── System Settings ──────────────────────────────────────────────────────────
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await prisma.systemSettings.findMany();
    // Transform to object for easier frontend use
    const settingsObj = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.patch('/api/settings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const updates = req.body; // { key: value, ... }
    
    const promises = Object.entries(updates).map(([key, value]) => 
      prisma.systemSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );
    
    await Promise.all(promises);
    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

// ─── NEW ERP SCAFFOLDING APIs ────────────────────────────────────────────────

/**
 * GET /api/reports/target-vs-actual
 * Query the annual_plans table, extract JSON target data for a specific month,
 * and return it to prepopulate the frontend form.
 */
app.get('/api/reports/target-vs-actual', authenticateToken, async (req, res) => {
  try {
    const { annual_plan_id, month } = req.query;
    
    if (!annual_plan_id || !month) {
      return res.status(400).json({ error: 'annual_plan_id and month query parameters are required' });
    }

    const plan = await prisma.annualPlan.findUnique({
      where: { id: annual_plan_id }
    });

    if (!plan) return res.status(404).json({ error: 'Annual Plan not found' });

    // Assuming metrics_payload holds an array of metrics or a dictionary mapping month -> data
    const payload = plan.metrics_payload || {};
    // This is a generic scaffolding approach for extracting the target data
    const monthTargetData = payload[month] || null;

    if (!monthTargetData) {
      return res.status(404).json({ error: `No target data found for month: ${month}` });
    }

    return res.json({ targetData: monthTargetData });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch target data' });
  }
});

/**
 * POST /api/workflow/review
 * Handle approval/correction loop. Updates the document status and creates 
 * a new row in approval_logs with the feedback.
 */
app.post('/api/workflow/review', authenticateToken, async (req, res) => {
  try {
    const { document_type, document_id, action_taken, feedback_comment } = req.body;
    const reviewer_id = req.user.id;

    if (!document_type || !document_id || !action_taken) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (action_taken === 'CORRECTION_REQUESTED' && !feedback_comment) {
      return res.status(400).json({ error: 'Feedback comment is mandatory when requesting corrections' });
    }

    // Run within a transaction to ensure both log creation and status update succeed seamlessly
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the approval log
      const log = await tx.approvalLog.create({
        data: {
          document_type,
          document_id,
          reviewer_id,
          action_taken,
          feedback_comment
        }
      });

      // 2. Determine target status
      const targetStatus = action_taken === 'APPROVED' ? 'APPROVED' : 'CORRECTION_REQUIRED';

      // 3. Update the underlying document status
      if (document_type === 'ANNUAL_PLAN') {
        await tx.annualPlan.update({
          where: { id: document_id },
          data: { status: targetStatus, updated_at: new Date() }
        });
      } else if (document_type === 'MONTHLY_REPORT') {
        await tx.monthlyReport.update({
          where: { id: document_id },
          data: { status: targetStatus, updated_at: new Date() }
        });
      } else {
        throw new Error('Unsupported document_type');
      }

      return log;
    });

    return res.json({ message: 'Workflow action processed successfully', log: result });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to process workflow action' });
  }
});

// ─── AMHARIC FORM WIZARD – Submit Report / Plan ───────────────────────────────
app.post('/api/reports', authenticateToken, async (req, res) => {
  try {
    const {
      document_type,
      reporting_month,
      academic_year,
      location_id,
      actuals_payload,
      metrics_payload,
    } = req.body;

    if (!document_type || !academic_year) {
      return res.status(400).json({ error: 'document_type and academic_year are required.' });
    }

    const payload = actuals_payload || metrics_payload;

    // Build a human-readable title
    const title = document_type === 'MONTHLY_REPORT'
      ? `Monthly Report – ${reporting_month || ''} ${academic_year}`
      : `Annual Plan – ${academic_year}`;

    // Persist to MonthlyReport table (re-using as a generic document store)
    const record = await prisma.monthlyReport.create({
      data: {
        title,
        status: 'PENDING_REVIEW',
        userId: req.user.id,
        content: JSON.stringify({
          document_type,
          reporting_month: reporting_month || null,
          academic_year,
          location_id: location_id || null,
          payload,
        }),
      },
    });

    res.status(201).json({
      message: `${document_type === 'MONTHLY_REPORT' ? 'Monthly Report' : 'Annual Plan'} submitted successfully.`,
      reportId: record.id,
      title: record.title,
      status: record.status,
    });

  } catch (error) {
    console.error('POST /api/reports error:', error);
    res.status(500).json({ error: error.message || 'Failed to save report.' });
  }
});

app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    const { role, id, region, subRegion } = req.user;

    let userWhere = {};

    if (role === 'AREA_STAFF') {
      // Own reports only
      userWhere = { id };
    } else if (role === 'SUB_REGIONAL') {
      // All area staff in the same subRegion
      userWhere = { subRegion, role: 'AREA_STAFF' };
    } else if (role === 'COORDINATOR') {
      // All area and sub-regional staff in the same region
      userWhere = { region, role: { in: ['AREA_STAFF', 'SUB_REGIONAL'] } };
    }
    // ADMIN / EXECUTIVE: no filter — see everything

    const scopedUserIds = Object.keys(userWhere).length > 0
      ? (await prisma.user.findMany({ where: userWhere, select: { id: true } })).map(u => u.id)
      : null;

    const reports = await prisma.monthlyReport.findMany({
      where: scopedUserIds
        ? { userId: { in: scopedUserIds } }
        : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { name: true, email: true, role: true, area: true, subRegion: true, region: true },
        },
      },
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch reports.' });
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Backend API Server running at http://localhost:${port}`);
  console.log(`   Coordinator: POST /api/auth/register | POST /api/auth/login`);
  console.log(`   Executive:   POST /api/auth/executive/register | POST /api/auth/executive/login`);
  console.log(`   Admin:       POST /api/auth/admin/register | POST /api/auth/admin/login`);
  console.log(`   Executive access code: SUE-EXEC-2024`);
  console.log(`   Admin access code:     SUE-ADMIN-2024\n`);
});
