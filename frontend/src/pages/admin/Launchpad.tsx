import React, { useState } from 'react';
import { api } from '../../api/api';
import './Admin.css';

const Launchpad: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STAFF' | 'ASSETS'>('STAFF');
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rawFileContent, setRawFileContent] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawFileContent(text);
      const rows = text.split('\n').slice(0, 6).map(row => row.split(','));
      setPreview(rows);
    };
    reader.readAsText(file);
  };

  const executeMigration = async () => {
    if (!rawFileContent) return;
    setLoading(true);
    
    try {
      const rows = rawFileContent.split('\n').filter(r => r.trim());
      const headers = rows[0].split(',').map(h => h.trim());
      const data = rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((acc: any, h, i) => {
          acc[h] = values[i]?.trim();
          return acc;
        }, {});
      });

      let result;
      if (activeTab === 'STAFF') {
        result = await api.migrateStaff(data);
      } else {
        result = await api.migrateAssets(data);
      }

      setResults(result.results);
      alert(`Migration Finished! Imported: ${result.results.imported}, Skipped: ${result.results.skipped}`);
    } catch (err) {
      console.error(err);
      alert('Migration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-portal">
      <aside className="admin-sidebar">
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#6366f1', marginBottom: '40px' }}>SYSTEM OPS</div>
        <nav>
          <div className={`media-nav-item ${activeTab === 'STAFF' ? 'active' : ''}`} onClick={() => setActiveTab('STAFF')}>👥 Staff Migration</div>
          <div className={`media-nav-item ${activeTab === 'ASSETS' ? 'active' : ''}`} onClick={() => setActiveTab('ASSETS')}>📦 Asset Migration</div>
          <div className="media-nav-item">⚙️ Settings</div>
        </nav>
      </aside>

      <main className="admin-content">
        <header style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900 }}>Launchpad V2</h1>
          <p style={{ color: '#64748b' }}>Technical migration desk and idempotency control.</p>
        </header>

        <section className="migration-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          <div className="migration-main-lane">
            <label className="dropzone">
              <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
              <div className="dropzone-icon">📄</div>
              <div style={{ fontWeight: 700 }}>Upload {activeTab} CSV</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Ensure legacyId column exists for sync stability</div>
            </label>

            {preview.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Data Preview (Top 5 Rows)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {preview[0].map((h: string, i: number) => <th key={i}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(1).map((row, i) => (
                        <tr key={i}>
                          {row.map((v: string, j: number) => <td key={j}>{v}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  className="btn-indigo" 
                  style={{ width: '100%', marginTop: '24px' }} 
                  onClick={executeMigration}
                  disabled={loading}
                >
                  {loading ? 'Executing...' : `Execute ${activeTab} Migration`}
                </button>
              </div>
            )}

            {results && (
              <div style={{ marginTop: '32px', padding: '24px', background: '#0b1120', borderRadius: '16px', border: '1px solid #1e293b' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Migration Results</h3>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 800 }}>IMPORTED</div>
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>{results.imported}</div>
                  </div>
                  <div style={{ background: 'rgba(100, 116, 139, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800 }}>SKIPPED</div>
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>{results.skipped}</div>
                  </div>
                  <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    <div style={{ fontSize: '10px', color: '#f43f5e', fontWeight: 800 }}>FAILED</div>
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>{results.failedRows?.length || 0}</div>
                  </div>
                </div>

                {results.failedRows?.length > 0 && (
                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '12px', color: '#f43f5e', textTransform: 'uppercase', marginBottom: '12px' }}>Rejection Report</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {results.failedRows.map((f: any, i: number) => (
                        <div key={i} style={{ fontSize: '12px', padding: '8px 12px', background: '#020617', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #1e293b' }}>
                          <span style={{ fontWeight: 700 }}>{f.email || `Row #${f.index}`}</span>
                          <span style={{ color: '#64748b' }}>{f.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="migration-sidebar-lane">
             <div className="admin-card" style={{ background: '#0b1120', padding: '32px', borderRadius: '16px', border: '1px solid #1e293b' }}>
               <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Migration Protocol</h3>
               <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.8' }}>
                 <li>Idempotency enforced via <code>legacyId</code> unique constraint.</li>
                 <li>Passwords default to <code>Temporary@123</code> if unspecified.</li>
                 <li>Asset serial numbers auto-generated if missing.</li>
                 <li>Role mapping: <code>ADMIN</code>, <code>NATIONAL_DIRECTOR</code>, <code>REGIONAL_DIRECTOR</code>, etc.</li>
               </ul>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Launchpad;
