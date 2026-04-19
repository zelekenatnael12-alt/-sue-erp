import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Reuse Login styles

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('AREA_STAFF');
  const [region, setRegion] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.mustChangePassword) {
        navigate('/change-password');
        return;
      }
      switch (user.role) {
        case 'EXECUTIVE': navigate('/executive'); break;
        case 'ADMIN': navigate('/admin'); break;
        case 'COORDINATOR': navigate('/regional'); break;
        case 'SUB_REGIONAL': navigate('/sub-regional'); break;
        default: navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        region: role === 'EXECUTIVE' || role === 'ADMIN' ? undefined : region,
        accessCode: role === 'EXECUTIVE' || role === 'ADMIN' ? accessCode : undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const isAccessCodeRequired = role === 'EXECUTIVE' || role === 'ADMIN';
  const isGeographyRelevant = !isAccessCodeRequired;

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="40" height="40" rx="10" fill="#2563EB"/>
              <path d="M12 10h7a5 5 0 0 1 5 5v14a3 3 0 0 0-3-3h-9V10z" fill="white"/>
              <path d="M28 10h-7a5 5 0 0 0-5 5v14a3 3 0 0 1 3-3h9V10z" fill="rgba(255,255,255,0.55)"/>
            </svg>
          </div>
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Scripture Union Ethiopia Portal</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7.5" stroke="#DC2626" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Abebe Bikila"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@sueethiopia.org"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select
              id="role"
              className="form-input"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="AREA_STAFF">Area Coordinator</option>
              <option value="SUB_REGIONAL">Sub Regional Coordinator</option>
              <option value="COORDINATOR">Regional Director</option>
              <option value="ADMIN">Admin</option>
              <option value="EXECUTIVE">Excutive</option>
            </select>
          </div>

          {isGeographyRelevant && (
            <div className="form-group">
              <label className="form-label" htmlFor="region">Region / Area</label>
              <input
                id="region"
                type="text"
                className="form-input"
                placeholder="e.g. Addis Ababa"
                value={region}
                onChange={e => setRegion(e.target.value)}
              />
            </div>
          )}

          {isAccessCodeRequired && (
            <div className="form-group">
              <label className="form-label" htmlFor="accessCode">Access Code</label>
              <input
                id="accessCode"
                type="password"
                className="form-input"
                placeholder="Required for Exec/Admin"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Must be at least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <><span className="btn-spinner" aria-hidden="true" />Registering…</>
            ) : (
              <>
                Register
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.75 9h10.5M9.75 5.25 13.5 9l-3.75 3.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="login-footer">
          Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
