import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import AmharicFormWizard from './pages/wizard/AmharicFormWizard';
import SouthEthiopiaTree from './pages/dashboards/suethiopiatree';
import AreaReports from './pages/dashboards/AreaReports';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ExecutiveDashboard from './pages/dashboards/ExecutiveDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicVerify from './pages/PublicVerify';
import Reports from './pages/Reports';
import DetailedRegionalReport from './pages/DetailedRegionalReport';
import Volunteers from './pages/Volunteers';
import Settings from './pages/Settings';
import AdminLayout from './layouts/AdminLayout';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReports from './pages/admin/AdminReports';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminEvents from './pages/admin/AdminEvents';
import AdminStaff from './pages/admin/AdminStaff';
import AdminFinancials from './pages/admin/AdminFinancials';
import AdminExport from './pages/admin/AdminExport';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminSettings from './pages/admin/AdminSettings';
import Help from './pages/Help';
import ChangePassword from './pages/ChangePassword';
import CapacityWorkflow from './pages/CapacityWorkflow';
import TerritoryWorkflow from './pages/TerritoryWorkflow';
import AreaLayout from './pages/area/AreaLayout';
import AreaHome from './pages/area/AreaHome';
import RegisterSchool from './pages/area/RegisterSchool';
import RegisterPersonnel from './pages/area/RegisterPersonnel';
import PsrHub from './pages/area/PsrHub';
import WeeklyProgress from './pages/area/WeeklyProgress';
import PlanningReporting from './pages/area/PlanningReporting';
import IdServices from './pages/area/IdServices';
import AssociateLayout from './pages/associate/AssociateLayout';
import AssociateHome from './pages/associate/AssociateHome';
import SchoolIntelligence from './pages/area/SchoolIntelligence';
import SubRegionalLayout from './pages/subregional/SubRegionalLayout';
import SubRegionalHome from './pages/subregional/SubRegionalHome';
import ProxySchoolEntry from './pages/subregional/ProxySchoolEntry';
import ManagerForms from './pages/subregional/ManagerForms';
import CreateEvent from './pages/subregional/CreateEvent';
import TeamApprovals from './pages/subregional/TeamApprovals';
import ManagerPlanning from './pages/subregional/ManagerPlanning';
import Network from './pages/subregional/Network';
import RegionalLayout from './pages/regional/RegionalLayout';
import RegionalHome from './pages/regional/RegionalHome';
import AssetRegistry from './pages/regional/AssetRegistry';
import AdvisoryBoard from './pages/regional/AdvisoryBoard';
import StructuralReview from './pages/regional/StructuralReview';
import Treasury from './pages/regional/Treasury';
import RegionalPlanning from './pages/regional/RegionalPlanning';
import RegionalReports from './pages/regional/RegionalReports';
import RegionalAreas from './pages/regional/RegionalAreas';
import RegionalAssociates from './pages/regional/RegionalAssociates';
import RegionalStrategy from './pages/regional/RegionalStrategy';
import NationalHome from './pages/national/NationalHome';
import FinanceHome from './pages/finance/FinanceHome';
import MinistryHome from './pages/schoolministry/MinistryHome';
import OperationsDesk from './pages/schoolministry/OperationsDesk';
import PartnershipHome from './pages/partnership/PartnershipHome';
import CapacityHome from './pages/capacity/CapacityHome';
import MediaHome from './pages/media/MediaHome';
import StaffHome from './pages/nationalstaff/StaffHome';
import DepartmentalReporting from './pages/nationalstaff/DepartmentalReporting';
import Launchpad from './pages/admin/Launchpad';
import SyncDashboard from './pages/admin/SyncDashboard';
import UnderConstruction from './pages/UnderConstruction';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/erp">
        <ErrorBoundary>
          <Routes>
            <Route path="/under-construction" element={<UnderConstruction />} />

            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify/:idNumber" element={<PublicVerify />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Area Dashboard - AREA_STAFF only */}
            <Route
              path="/area"
              element={
                <PrivateRoute allowedRoles={['AREA_STAFF']}>
                  <DashboardLayout title="Area Dashboard" type="AREA" />
                </PrivateRoute>
              }
            >
              <Route element={<AreaLayout />}>
                <Route index element={<AreaHome />} />
                <Route path="home" element={<AreaHome />} />
                <Route path="weekly" element={<WeeklyProgress />} />
                <Route path="planning" element={<PlanningReporting />} />
                <Route path="register-school" element={<RegisterSchool />} />
                <Route path="register-personnel" element={<RegisterPersonnel />} />
                <Route path="intelligence" element={<SchoolIntelligence />} />
                <Route path="psr" element={<PsrHub />} />
                <Route path="id-services" element={<IdServices />} />
                <Route path="reports" element={<AreaReports />} />
                <Route path="reports/:id" element={<DetailedRegionalReport />} />
                <Route path="volunteers" element={<Volunteers />} />
              </Route>
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
            </Route>

            {/* Associate Portal - ASSOCIATE staff serving under Area Coordinator */}
            <Route
              path="/associate"
              element={
                <PrivateRoute allowedRoles={['ASSOCIATE', 'AREA_STAFF']}>
                  <DashboardLayout title="Associate Portal" type="ASSOCIATE" />
                </PrivateRoute>
              }
            >
              <Route element={<AssociateLayout />}>
                <Route index element={<AssociateHome />} />
                <Route path="home" element={<AssociateHome />} />
                <Route path="register-school" element={<RegisterSchool />} />
                <Route path="weekly" element={<WeeklyProgress />} />
                <Route path="volunteers" element={<Volunteers />} />
              </Route>
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route
              path="/sub-regional"
              element={
                <PrivateRoute allowedRoles={['SUB_REGIONAL']}>
                  <DashboardLayout title="Sub-Regional Dashboard" type="SUB_REGIONAL" />
                </PrivateRoute>
              }
            >
              <Route element={<SubRegionalLayout />}>
                <Route index element={<SubRegionalHome />} />
                <Route path="home" element={<SubRegionalHome />} />
                <Route path="create-event" element={<CreateEvent />} />
                <Route path="proxy-school" element={<ProxySchoolEntry />} />
                <Route path="manager-form" element={<ManagerForms />} />
                <Route path="planning" element={<ManagerPlanning />} />
                <Route path="approvals" element={<TeamApprovals />} />
                <Route path="network" element={<Network />} />
                <Route path="profile" element={<Settings />} />
                <Route path="reports" element={<Reports />} />
                <Route path="reports/:id" element={<DetailedRegionalReport />} />
                <Route path="volunteers" element={<Volunteers />} />
              </Route>
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
            </Route>

            {/* Regional Dashboard - COORDINATOR only */}
            <Route
              path="/regional"
              element={
                <PrivateRoute allowedRoles={['COORDINATOR']}>
                  <DashboardLayout title="Regional Dashboard" type="REGIONAL" />
                </PrivateRoute>
              }
            >
              <Route element={<RegionalLayout />}>
                <Route index element={<RegionalHome />} />
                <Route path="home" element={<RegionalHome />} />
                <Route path="assets" element={<AssetRegistry />} />
                <Route path="advisory" element={<AdvisoryBoard />} />
                <Route path="structural-review" element={<StructuralReview />} />
                <Route path="planning" element={<RegionalPlanning />} />
                <Route path="treasury" element={<Treasury />} />
                <Route path="approvals" element={<RegionalReports />} />
                <Route path="areas" element={<RegionalAreas />} />
                <Route path="associates" element={<RegionalAssociates />} />
                <Route path="strategy" element={<RegionalStrategy />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
              </Route>
            </Route>

            {/* National Portal - NATIONAL_DIRECTOR & EXECUTIVE only */}
            <Route
              path="/national"
              element={
                <PrivateRoute allowedRoles={['NATIONAL_DIRECTOR', 'EXECUTIVE', 'ADMIN']}>
                  <DashboardLayout title="National Matrix" type="NATIONAL" />
                </PrivateRoute>
              }
            >
              <Route index element={<NationalHome />} />
              <Route path="home" element={<NationalHome />} />
            </Route>

            {/* Finance Portal - FINANCE_ADMIN & ADMIN only */}
            <Route
              path="/finance"
              element={
                <PrivateRoute allowedRoles={['FINANCE_ADMIN', 'ADMIN']}>
                  <DashboardLayout title="Finance Engine" type="FINANCE" />
                </PrivateRoute>
              }
            >
              <Route index element={<FinanceHome />} />
            </Route>

            {/* School Ministry Portal - SCHOOL_MINISTRY_DIRECTOR only */}
            <Route
              path="/school-ministry"
              element={
                <PrivateRoute allowedRoles={['SCHOOL_MINISTRY_DIRECTOR', 'ADMIN']}>
                  <DashboardLayout title="Ministry Core" type="SCHOOL_MINISTRY" />
                </PrivateRoute>
              }
            >
              <Route index element={<MinistryHome />} />
              <Route path="operations" element={<OperationsDesk />} />
            </Route>
            <Route
              path="/school-ministry/operations"
              element={
                <PrivateRoute allowedRoles={['SCHOOL_MINISTRY_DIRECTOR', 'ADMIN']}>
                  <OperationsDesk />
                </PrivateRoute>
              }
            />

            {/* Partnership Portal - PARTNERSHIP_DIRECTOR only */}
            <Route
              path="/partnership"
              element={
                <PrivateRoute allowedRoles={['PARTNERSHIP_DIRECTOR', 'ADMIN']}>
                  <DashboardLayout title="Partnership Hub" />
                </PrivateRoute>
              }
            >
               <Route index element={<PartnershipHome />} />
            </Route>

            {/* Staff Capacity Portal - CAPACITY_DIRECTOR only */}
            <Route
              path="/capacity"
              element={
                <PrivateRoute allowedRoles={['CAPACITY_DIRECTOR', 'ADMIN']}>
                   <DashboardLayout title="Capacity Command" />
                </PrivateRoute>
              }
            >
               <Route index element={<CapacityHome />} />
            </Route>

            {/* Media & Comm Portal - MEDIA_DIRECTOR and ADMIN only */}
            <Route
              path="/media"
              element={
                <PrivateRoute allowedRoles={['MEDIA_DIRECTOR', 'ADMIN']}>
                   <DashboardLayout title="Media Hub" type="MEDIA" />
                </PrivateRoute>
              }
            >
               <Route index element={<MediaHome />} />
            </Route>

            {/* National Staff Specialist Portal */}
            <Route
              path="/staff-portal"
              element={
                <PrivateRoute allowedRoles={['NATIONAL_STAFF', 'ADMIN']}>
                  <StaffHome />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff-portal/report"
              element={
                <PrivateRoute allowedRoles={['NATIONAL_STAFF', 'ADMIN']}>
                  <DepartmentalReporting />
                </PrivateRoute>
              }
            />

            {/* System Admin Tools */}
            <Route
              path="/system-admin/launchpad"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <Launchpad />
                </PrivateRoute>
              }
            />
            <Route
              path="/system-admin/sync-health"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <SyncDashboard />
                </PrivateRoute>
              }
            />

            {/* Protected Admin - ADMIN only */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'EXECUTIVE']}>
                  <DashboardLayout title="Admin Command" type="ADMIN" />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="financials" element={<AdminFinancials />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="export" element={<AdminExport />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="help" element={<Help />} />
            </Route>

            {/* Protected Executive - EXECUTIVE only */}
            <Route
              path="/executive"
              element={
                <PrivateRoute allowedRoles={['EXECUTIVE']}>
                  <AdminLayout isExecutive />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ExecutiveDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="reports" element={<AdminReports isExecutive />} />
              <Route path="users" element={<AdminUsers isExecutive />} />
              <Route path="staff" element={<AdminStaff isExecutive />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="financials" element={<AdminFinancials isExecutive />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="export" element={<AdminExport />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="help" element={<Help />} />
            </Route>

            {/* Protected Wizard & Forms - Shared for Field Staff */}
            <Route
              path="/plan"
              element={
                <PrivateRoute allowedRoles={['AREA_STAFF', 'SUB_REGIONAL', 'COORDINATOR']}>
                  <AmharicFormWizard mode="PLAN" />
                </PrivateRoute>
              }
            />
            <Route
              path="/report/new"
              element={
                <PrivateRoute allowedRoles={['AREA_STAFF', 'SUB_REGIONAL', 'COORDINATOR']}>
                  <AmharicFormWizard mode="REPORT" />
                </PrivateRoute>
              }
            />

            <Route
              path="/south-ethiopia-tree"
              element={
                <PrivateRoute allowedRoles={['AREA_STAFF', 'SUB_REGIONAL', 'COORDINATOR', 'ADMIN', 'EXECUTIVE']}>
                  <SouthEthiopiaTree />
                </PrivateRoute>
              }
            />

            <Route
              path="/capacity-workflow"
              element={<CapacityWorkflow />}
            />

            <Route
              path="/territory-workflow"
              element={<TerritoryWorkflow />}
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
