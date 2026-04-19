import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAVIGATION_REGISTRY } from '../config/navigationRegistry';
import './Sidebar.css';

interface SidebarProps {
  type?: string; // Change to string to allow any registry key
}

const Sidebar = ({ type = 'REGIONAL' }: SidebarProps) => {
  const { user } = useAuth();
  
  const config = NAVIGATION_REGISTRY[type] || NAVIGATION_REGISTRY['REGIONAL'];
  
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="material-symbols-outlined">{config.icon}</span>
        </div>
        <div className="sidebar__title">
          <h2>{config.title}</h2>
          <p>{config.subTitle}</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        {config.items.map((item, index) => (
          <NavLink 
            key={index}
            to={item.path} 
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            end={item.end}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar__divider"></div>

        <NavLink 
          to={`${config.basePath}/settings`}
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </NavLink>
        <NavLink 
          to={`${config.basePath}/help`} 
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">help</span>
          <span>Help Center</span>
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <div className="user-profile">
          <div className="user-profile__avatar">
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>account_circle</span>
          </div>
          <div className="user-profile__info">
            <p className="user-profile__name">{user?.name || 'User'}</p>
            <p className="user-profile__role">{user?.role || 'Member'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
