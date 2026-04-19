import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const AdminSidebar = ({ isExecutive }: { isExecutive?: boolean }) => {
  const { user } = useAuth();
  const portalName = isExecutive ? 'Executive Portal' : 'Admin Portal';
  const portalIcon = isExecutive ? 'shield_person' : 'admin_panel_settings';
  
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="material-symbols-outlined">{portalIcon}</span>
        </div>
        <div className="sidebar__title">
          <h2>SU Ethiopia</h2>
          <p>{portalName}</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        <NavLink 
          to="/admin/overview" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Overview</span>
        </NavLink>
        
        <NavLink 
          to="/admin/analytics" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">bar_chart</span>
          <span>Executive Analytics</span>
        </NavLink>

        <NavLink 
          to="/admin/reports" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">lab_profile</span>
          <span>All Reports</span>
        </NavLink>

        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">manage_accounts</span>
          <span>Users & Coordinators</span>
        </NavLink>

        <NavLink 
          to="/admin/staff" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">badge</span>
          <span>Staff</span>
        </NavLink>

        <NavLink 
          to="/admin/events" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">event</span>
          <span>Events</span>
        </NavLink>

        <NavLink 
          to="/admin/financials" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">account_balance</span>
          <span>Financial Report</span>
        </NavLink>

        <NavLink 
          to="/admin/announcements" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">campaign</span>
          <span>Announcements</span>
        </NavLink>

        <NavLink 
          to="/admin/export" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">download</span>
          <span>Export Report</span>
        </NavLink>

        <NavLink 
          to="/admin/newsletter" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">newspaper</span>
          <span>Newsletter</span>
        </NavLink>

        <div className="sidebar__divider"></div>

        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </NavLink>
        
        <NavLink 
          to="/admin/help" 
           className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">help</span>
          <span>Help Center</span>
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <div className="user-profile">
          <div className="user-profile__avatar">
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#6366f1' }}>account_circle</span>
          </div>
          <div className="user-profile__info">
            <p className="user-profile__name">{user?.name || 'Admin'}</p>
            <p className="user-profile__role">{user?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
