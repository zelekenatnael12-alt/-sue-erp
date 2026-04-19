import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import './DashboardLayout.css'; // Reusing the same layout css for now

const AdminLayout = ({ isExecutive }: { isExecutive?: boolean }) => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar isExecutive={isExecutive} />
      <div className="dashboard-layout__main">
        <Header title="Admin Dashboard" />
        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
