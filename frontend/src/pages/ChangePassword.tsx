import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import './ChangePassword.css';

const REQUIREMENTS = [
  { id: 'length',  label: 'At least 8 characters',               test: (p: string) => p.length >= 8 },
  { id: 'number',  label: 'Contains a number',                   test: (p: string) => /\d/.test(p) },
  { id: 'upper',   label: 'Contains an uppercase letter',        test: (p: string) => /[A-Z]/.test(p) },
  { id: 'match',   label: 'New passwords match',                 test: (_: string, c: string) => !!c && _ === c },
];

export default function ChangePassword() {
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const met = (req: typeof REQUIREMENTS[0]) => req.test(next, confirm);
  const allMet = REQUIREMENTS.every(r => met(r));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!allMet) { setError('Please meet all password requirements before continuing.'); return; }

    setLoading(true);
    try {
      const data = await api.changePassword(current, next);
      // Persist the fresh token/user (mustChangePassword is now false)
      localStorage.setItem('sue_token', data.token);
      localStorage.setItem('sue_user', JSON.stringify(data.user));
      // Navigate to their home dashboard
      switch (data.user.role) {
        case 'EXECUTIVE':    navigate('/executive'); break;
        case 'ADMIN':        navigate('/admin'); break;
        case 'COORDINATOR':  navigate('/regional'); break;
        case 'SUB_REGIONAL': navigate('/sub-regional'); break;
        default:             navigate('/');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-page">
      <div className="cp-card">
        {/* Header */}
        <div className="cp-header">
          <div className="cp-icon-wrap">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="40" height="40" rx="10" fill="#2563EB"/>
              <path d="M20 11a6 6 0 0 0-6 6v1h-1a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1v-1a6 6 0 0 0-6-6zm0 2a4 4 0 0 1 4 4v1h-8v-1a4 4 0 0 1 4-4zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" fill="white"/>
            </svg>
          </div>
          <h1 className="cp-title">Secure Your Account</h1>
          {user?.name && <p className="cp-name">Welcome, {user.name}</p>}
          <p className="cp-subtitle">
            This is your first login. Please set a new personal password to continue.
          </p>
        </div>

        <form className="cp-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="cp-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7.5" stroke="#DC2626" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Temporary password */}
          <div className="cp-group">
            <label className="cp-label" htmlFor="cp-current">Temporary Password</label>
            <input
              id="cp-current"
              type="password"
              className="cp-input"
              placeholder="Enter your temporary password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              required
              autoComplete="current-password"
              autoFocus
            />
          </div>

          <div className="cp-divider" />

          {/* New password */}
          <div className="cp-group">
            <label className="cp-label" htmlFor="cp-new">New Password</label>
            <input
              id="cp-new"
              type="password"
              className="cp-input"
              placeholder="Create a strong password"
              value={next}
              onChange={e => setNext(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Confirm password */}
          <div className="cp-group">
            <label className="cp-label" htmlFor="cp-confirm">Confirm New Password</label>
            <input
              id="cp-confirm"
              type="password"
              className="cp-input"
              placeholder="Repeat your new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Requirements */}
          <ul className="cp-reqs">
            {REQUIREMENTS.map(req => {
              const pass = met(req);
              return (
                <li key={req.id} className={`cp-req ${next || confirm ? (pass ? 'cp-req--pass' : 'cp-req--fail') : ''}`}>
                  <span className="cp-req-dot" aria-hidden="true" />
                  {req.label}
                </li>
              );
            })}
          </ul>

          <button
            type="submit"
            className="cp-btn"
            disabled={loading}
          >
            {loading ? (
              <><span className="cp-spinner" aria-hidden="true" />Updating password…</>
            ) : (
              <>
                Update Password &amp; Enter Portal
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.75 9h10.5M9.75 5.25 13.5 9l-3.75 3.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="cp-footer">
          Your password is stored securely and never shared.
        </p>
      </div>
    </div>
  );
}
