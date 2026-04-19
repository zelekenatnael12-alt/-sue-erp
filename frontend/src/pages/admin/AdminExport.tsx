import { useState } from 'react';
import { api } from '../../api/api';
import './AdminExport.css';

export default function AdminExport() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: 'reports' | 'users' | 'financials' | 'events') => {
    setLoading(type);
    try {
      const url = api.getExportUrl(type);
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `sue_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Failed to download export');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="ax">
      <div className="ax__header">
        <h1 className="ax__title">Data Export Center</h1>
        <p className="ax__subtitle">Download system data in CSV format for offline analysis, archiving, or external reporting.</p>
      </div>

      <div className="ax__grid">
        <div className="ax__card card">
          <div className="ax__card-icon">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div className="ax__card-content">
            <h3>Regional Reports</h3>
            <p>Download all submitted reports including project names, coordinator details, and approval status.</p>
            <button 
              className="btn btn--primary" 
              onClick={() => handleExport('reports')}
              disabled={loading === 'reports'}
            >
              <span className="material-symbols-outlined">download</span>
              {loading === 'reports' ? 'Generating...' : 'Export Reports'}
            </button>
          </div>
        </div>

        <div className="ax__card card">
          <div className="ax__card-icon">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div className="ax__card-content">
            <h3>Financial Ledger</h3>
            <p>Full history of income and expenses, categorized and dated for comprehensive financial auditing.</p>
            <button 
              className="btn btn--primary" 
              onClick={() => handleExport('financials')}
              disabled={loading === 'financials'}
            >
              <span className="material-symbols-outlined">download</span>
              {loading === 'financials' ? 'Generating...' : 'Export Financials'}
            </button>
          </div>
        </div>

        <div className="ax__card card">
          <div className="ax__card-icon">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div className="ax__card-content">
            <h3>User Directory</h3>
            <p>Export a list of all registered coordinators, executives, and admins with their associated regions.</p>
            <button 
              className="btn btn--primary" 
              onClick={() => handleExport('users')}
              disabled={loading === 'users'}
            >
              <span className="material-symbols-outlined">download</span>
              {loading === 'users' ? 'Generating...' : 'Export Users'}
            </button>
          </div>
        </div>

        <div className="ax__card card">
          <div className="ax__card-icon">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <div className="ax__card-content">
            <h3>Events & Training</h3>
            <p>Summary of all scheduled and past events, including locations and visibility status.</p>
            <button 
              className="btn btn--primary" 
              onClick={() => handleExport('events')}
              disabled={loading === 'events'}
            >
              <span className="material-symbols-outlined">download</span>
              {loading === 'events' ? 'Generating...' : 'Export Events'}
            </button>
          </div>
        </div>
      </div>

      <div className="ax__tip card">
        <span className="material-symbols-outlined">info</span>
        <div>
          <h4>Export Tips</h4>
          <p>Exported files are in CSV format and can be opened with Microsoft Excel, Google Sheets, or any text editor. For the best experience in Excel, use the "Import Data" feature to ensure proper character encoding.</p>
        </div>
      </div>
    </div>
  );
}
