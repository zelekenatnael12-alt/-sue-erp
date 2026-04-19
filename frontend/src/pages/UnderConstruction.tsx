import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UnderConstruction.css';

const UnderConstruction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="construction-container">
      <div className="construction-glass">
        <div className="construction-icon">
          <span className="material-symbols-outlined">construct</span>
        </div>
        <h1>Under Development</h1>
        <p>
          This module is part of the SUE ERP Expansion. Our technical team is 
          currently integrating the backend services for this department.
        </p>
        <div className="construction-badge">Coming Q3 2026</div>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default UnderConstruction;
