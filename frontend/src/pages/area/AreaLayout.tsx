import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './AreaPortal.css';

const AreaLayout: React.FC = () => {
  return (
    <div className="area-portal">
      <main className="area-content">
        <Outlet />
      </main>

      <nav className="bottom-nav-bar">
        <NavLink to="/area/home" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">home</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/area/planning" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">edit_document</span>
          <span>Planning</span>
        </NavLink>
        <NavLink to="/area/intelligence" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">insights</span>
          <span>Intelligence</span>
        </NavLink>
        <NavLink to="/area/network" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">hub</span>
          <span>Network</span>
        </NavLink>
        <NavLink to="/area/support" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">contact_support</span>
          <span>Support</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AreaLayout;
