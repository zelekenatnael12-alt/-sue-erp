const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Enhanced AI Simulation Service
 * Analyzes regional plans and monthly actuals to generate synthetic "AI" insights.
 */
async function generateAiInsights() {
  const plans = await prisma.projectPlan.findMany({
    include: {
      coordinator: true,
      reports: true
    }
  });

  const categories = [
    'Visiting / Programmes',
    'SU Core Teachings',
    'Character Formation',
    'Mission',
    'Biblical Leadership Training',
    'Seminars',
    'SU Ministry associates',
    'Reports',
    'Staff Development',
    'Partnership Dev\'t',
    'Resource Mobilization',
    'Branch Office Organization',
    'Conference',
    'Capacity Building Program',
    'Follow up (Monitoring & Evaluation)'
  ];

  let strengths = [];
  let focusAreas = [];
  let reminders = [];

  if (!plans || plans.length === 0) {
    return {
      strengths: ["Waiting on regions to submit their annual plans to identify strengths."],
      focusAreas: ["No data available to determine areas of focus."],
      coordinatorReminders: [{
        region: "All Regions",
        reminder: "Please submit your annual project plans so AI analytics can begin tracking performance."
      }]
    };
  }

  // AI Simulation Logic
  let highPerformanceCategories = {};
  let lowPerformanceCategories = {};

  plans.forEach(plan => {
    // Collect specific reminders logically
    const totalReports = plan.reports.length;
    if (totalReports === 0 && plan.status === 'APPROVED') {
      reminders.push({
        region: plan.coordinator ? plan.coordinator.region : "Unknown",
        reminder: `No monthly actuals reported yet for '${plan.projectName}'. They are behind on tracking.`
      });
    }

    if (plan.reports && plan.reports.length > 0) {
      // Find the most recent monthly report
      const monthlyReports = plan.reports.filter(r => r.type === 'MONTHLY_UPDATE');
      if (monthlyReports.length > 0) {
        const lastReport = monthlyReports[monthlyReports.length - 1];
        try {
          const actuals = JSON.parse(lastReport.actualsMatrix || '{}');
          if (Object.keys(actuals).length === 0) {
            reminders.push({
              region: plan.coordinator ? plan.coordinator.region : "Unknown",
              reminder: `The ${lastReport.reportMonth} report was submitted with exactly zero activity actuals mapped. Review needed.`
            });
          } else {
             // Simulation: Randomly pick standard issues
             const issueCategories = ['Mission', 'Resource Mobilization', 'Visiting / Programmes'];
             const hit = issueCategories[Math.floor(Math.random() * issueCategories.length)];
             lowPerformanceCategories[hit] = (lowPerformanceCategories[hit] || 0) + 1;

             const strengthCategories = ['SU Core Teachings', 'Staff Development', 'Conference'];
             const strengthHit = strengthCategories[Math.floor(Math.random() * strengthCategories.length)];
             highPerformanceCategories[strengthHit] = (highPerformanceCategories[strengthHit] || 0) + 1;
          }
        } catch (e) {}
      }
    }
  });

  // Calculate top strength
  const topStrength = Object.keys(highPerformanceCategories).reduce((a, b) => highPerformanceCategories[a] > highPerformanceCategories[b] ? a : b, 'Biblical Leadership Training');
  const topWeakness = Object.keys(lowPerformanceCategories).reduce((a, b) => lowPerformanceCategories[a] > lowPerformanceCategories[b] ? a : b, 'Resource Mobilization');

  strengths = [
    `Consistent high performance in **${topStrength}** across multiple regions matching scheduled targets.`,
    "Staff Development and Conferences are well-budgeted and frequently reported accurately."
  ];

  focusAreas = [
    `**${topWeakness}** targets are consistently missed or reported zero by active regions. Additional focus or resources may be required here.`,
    "Check for delayed monthly actual reporting—several approved plans have no actuals entered for the expected month."
  ];

  if (reminders.length === 0) {
    reminders.push({
      region: "All Regions",
      reminder: "All coordinators are currently tracking according to expectations. No urgent reminders."
    });
  } else {
    // Limit to top 3 reminders to keep UI clean
    reminders = reminders.slice(0, 3);
  }

  return {
    strengths,
    focusAreas,
    coordinatorReminders: reminders
  };
}

module.exports = {
  generateAiInsights
};
