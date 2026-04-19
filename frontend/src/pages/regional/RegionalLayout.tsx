import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import '../area/AreaPortal.css';
import './Regional.css';

const RegionalLayout: React.FC = () => {
  return (
    <div className="regional-layout">
      <main className="regional-content">
        <Outlet />
      </main>

      <nav className="bottom-nav-bar">
        <NavLink to="/regional/home" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="nav-label">Home</span>
        </NavLink>
        <NavLink to="/regional/approvals" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">fact_check</span>
          <span className="nav-label">Approvals</span>
        </NavLink>
        <NavLink to="/regional/planning" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">event_note</span>
          <span className="nav-label">Planning</span>
        </NavLink>
        <NavLink to="/regional/strategy" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">monitoring</span>
          <span className="nav-label">Strategy</span>
        </NavLink>
        <NavLink to="/regional/areas" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">map</span>
          <span className="nav-label">Areas</span>
        </NavLink>
        <NavLink to="/regional/associates" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">diversity_3</span>
          <span className="nav-label">Associates</span>
        </NavLink>
        <NavLink to="/regional/settings" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="material-symbols-outlined">account_circle</span>
          <span className="nav-label">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default RegionalLayout;
