import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import './AdminSettings.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err: any) {
      setError('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (success) setSuccess('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.updateSettings(settings);
      setSuccess('System settings updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="as-loading">Loading system configuration...</div>;

  return (
    <div className="as">
      <div className="as__header">
        <h1 className="as__title">System Settings</h1>
        <p className="as__subtitle">Global configuration for the Scripture Union Ethiopia reporting platform.</p>
      </div>

      <form onSubmit={handleSave} className="as__form-container">
        {error && <div className="as__message as__message--error card">{error}</div>}
        {success && <div className="as__message as__message--success card">{success}</div>}

        <div className="as__section card">
          <div className="as__section-header">
            <span className="material-symbols-outlined">corporate_fare</span>
            <h3>Organization Information</h3>
          </div>
          <div className="as__grid">
            <div className="as__field">
              <label>Organization Name</label>
              <input 
                type="text" 
                value={settings.org_name || ''} 
                onChange={e => handleChange('org_name', e.target.value)}
                placeholder="Scripture Union Ethiopia"
              />
            </div>
            <div className="as__field">
              <label>Support Contact Email</label>
              <input 
                type="email" 
                value={settings.support_email || ''} 
                onChange={e => handleChange('support_email', e.target.value)}
                placeholder="support@scriptureunionethiopia.org"
              />
            </div>
          </div>
        </div>

        <div className="as__section card">
          <div className="as__section-header">
            <span className="material-symbols-outlined">settings_suggest</span>
            <h3>Reporting Parameters</h3>
          </div>
          <div className="as__grid">
            <div className="as__field">
              <label>Fiscal Year Start Month</label>
              <select 
                value={settings.fiscal_start || '1'} 
                onChange={e => handleChange('fiscal_start', e.target.value)}
              >
                <option value="1">January (Meskerem)</option>
                <option value="9">September (Meskerem - Ethiopian)</option>
              </select>
            </div>
            <div className="as__field">
              <label>Default Currency Code</label>
              <input 
                type="text" 
                value={settings.currency || 'ETB'} 
                onChange={e => handleChange('currency', e.target.value)}
                placeholder="ETB"
              />
            </div>
          </div>
        </div>

        <div className="as__section card">
          <div className="as__section-header">
            <span className="material-symbols-outlined">security</span>
            <h3>Access & Security</h3>
          </div>
          <div className="as__grid">
            <div className="as__field">
              <label>Registration Secret (Admin Only)</label>
              <input 
                type="password" 
                value={settings.admin_secret || ''} 
                onChange={e => handleChange('admin_secret', e.target.value)}
                placeholder="Leave blank to keep current"
              />
              <p className="as__help">This code is required for new admin registrations.</p>
            </div>
            <div className="as__field">
              <label>Maintenance Mode</label>
              <div className="as__toggle-wrapper">
                <input 
                  type="checkbox" 
                  checked={settings.maintenance === 'true'} 
                  onChange={e => handleChange('maintenance', String(e.target.checked))}
                />
                <span>Enable maintenance mode (Freezes all report submissions)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="as__footer">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            <span className="material-symbols-outlined">save</span>
            {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
