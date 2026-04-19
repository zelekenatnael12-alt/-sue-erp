import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import '../area/AreaPortal.css'; // Reuse core mobile styles

const SubRegionalLayout: React.FC = () => {
  return (
    <div className="area-layout">
      <main className="area-content">
        <Outlet />
      </main>

      <nav className="bottom-nav-bar">
        <NavLink to="/sub-regional/home" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="nav-label">Home</span>
        </NavLink>
        <NavLink to="/sub-regional/approvals" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">rule</span>
          <span className="nav-label">Approvals</span>
        </NavLink>
        <NavLink to="/sub-regional/planning" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">event_note</span>
          <span className="nav-label">Planning</span>
        </NavLink>
        <NavLink to="/sub-regional/network" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">hub</span>
          <span className="nav-label">Network</span>
        </NavLink>
        <NavLink to="/sub-regional/profile" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">person</span>
          <span className="nav-label">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default SubRegionalLayout;
