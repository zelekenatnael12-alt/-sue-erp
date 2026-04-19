import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import './../media/Media.css';

const DepartmentalReporting: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    narrative: '',
    metrics: [{ key: '', value: '' }]
  });
  const navigate = useNavigate();

  const addMetric = () => {
    setFormData({ ...formData, metrics: [...formData.metrics, { key: '', value: '' }] });
  };

  const updateMetric = (index: number, f: 'key' | 'value', v: string) => {
    const next = [...formData.metrics];
    next[index][f] = v;
    setFormData({ ...formData, metrics: next });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        title: formData.title,
        narrative: formData.narrative,
        metricsJson: formData.metrics.reduce((acc: any, m) => {
          if (m.key) acc[m.key] = m.value;
          return acc;
        }, {})
      };

      await api.submitDepartmentalReport(payload);
      alert('Departmental Report Submitted!');
      navigate('/staff-portal');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Submission failed');
    }
  };

  return (
    <div className="media-portal" style={{ background: '#020617' }}>
      <div className="media-content">
        <div className="wizard-container">
          <div className="wizard-card">
            <header style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '25%', height: '4px', background: '#e11d48', borderRadius: '2px' }}></div>
                <div style={{ width: '25%', height: '4px', background: step >= 2 ? '#e11d48' : '#1e293b', borderRadius: '2px' }}></div>
                <div style={{ width: '25%', height: '4px', background: step >= 3 ? '#e11d48' : '#1e293b', borderRadius: '2px' }}></div>
                <div style={{ width: '25%', height: '4px', background: step >= 4 ? '#e11d48' : '#1e293b', borderRadius: '2px' }}></div>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 900 }}>Departmental Progress Report</h2>
              <p style={{ color: '#64748b' }}>Step {step} of 4</p>
            </header>

            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Basic Information</h3>
                <input 
                  type="text" 
                  placeholder="Report Title (e.g., April Digital Outreach Sum...)" 
                  style={{ width: '100%', background: '#020617', border: '1px solid #334155', color: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
                <button className="btn-submit" onClick={() => setStep(2)}>Continue to Narrative</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>The Narrative</h3>
                <textarea 
                  placeholder="Describe your primary achievements and departmental health..." 
                  style={{ width: '100%', height: '200px', background: '#020617', border: '1px solid #334155', color: '#fff', padding: '16px', borderRadius: '12px', resize: 'none' }}
                  value={formData.narrative}
                  onChange={e => setFormData({ ...formData, narrative: e.target.value })}
                />
                <button className="btn-submit" onClick={() => setStep(3)}>Continue to Metrics</button>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Departmental KPIs (Dynamic Metrics)</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Add specific metrics relative to your sub-department (e.g. "App Installs", "Books Sold").</p>
                {formData.metrics.map((m, i) => (
                  <div className="metric-input-row" key={i}>
                    <input 
                      style={{ flex: 1 }} 
                      placeholder="Metric Name" 
                      value={m.key} 
                      onChange={e => updateMetric(i, 'key', e.target.value)} 
                    />
                    <input 
                      style={{ flex: 1 }} 
                      placeholder="Value" 
                      value={m.value} 
                      onChange={e => updateMetric(i, 'value', e.target.value)} 
                    />
                  </div>
                ))}
                <button className="btn-add-metric" onClick={addMetric}>+ Add Another Metric</button>
                <button className="btn-submit" onClick={() => setStep(4)}>Final Review</button>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Final Execution</h3>
                <div style={{ background: '#020617', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b' }}>
                  <div style={{ fontWeight: 800 }}>{formData.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>{formData.narrative.substring(0, 100)}...</div>
                  <div style={{ marginTop: '16px', fontSize: '12px' }}>
                    {formData.metrics.map((m, i) => m.key && <div key={i}>{m.key}: {m.value}</div>)}
                  </div>
                </div>
                <button className="btn-submit" style={{ background: '#10b981' }} onClick={handleSubmit}>🚀 Submit to National Director</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentalReporting;
