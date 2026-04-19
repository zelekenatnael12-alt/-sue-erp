import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  title?: string;
  type?: string;
}

const DashboardLayout = ({ title, type }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const displayTitle = title || (
    user?.role === 'EXECUTIVE' ? 'Executive Dashboard' : 
    user?.role === 'ASSOCIATE' ? 'Associate Portal' :
    'Regional Dashboard'
  );
  
  return (
    <div className="dashboard-layout">
      <Sidebar type={type} />
      <div className="dashboard-layout__main">
        <Header title={displayTitle} />
        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
