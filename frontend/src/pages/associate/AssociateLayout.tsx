import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import '../area/AreaPortal.css'; // Reusing area styles for consistency

const AssociateLayout: React.FC = () => {
  return (
    <div className="area-portal">
      <main className="area-content">
        <Outlet />
      </main>

      <nav className="bottom-nav-bar">
        <NavLink to="/associate/home" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">home</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/associate/volunteers" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">group</span>
          <span>Volunteers</span>
        </NavLink>
        <NavLink to="/under-construction" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">contact_support</span>
          <span>Support</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AssociateLayout;
