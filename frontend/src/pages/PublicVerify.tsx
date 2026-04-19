import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './PublicVerify.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface VerifiedStaff {
  id: number;
  full_name: string;
  fullNameAmharic?: string;
  firstNameAm?: string;
  lastNameAm?: string;
  title?: string;
  titleAm?: string;
  role: string;
  roleAmharic?: string;
  idNumber: string;
  photoUrl: string | null;
  isActive: boolean;
  department: string;
  departmentAm?: string;
  officeAddress?: string;
  nationality?: string;
  issueDate?: string;
  expireDate?: string;
  phone?: string;
}

function formatDate(d?: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PublicVerify() {
  const { idNumber } = useParams<{ idNumber: string }>();
  const [data, setData] = useState<VerifiedStaff | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!idNumber) return;
    setLoading(true);
    fetch(`${BASE_URL}/api/public/verify-staff/${encodeURIComponent(idNumber)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setData)
      .catch(code => { if (code === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [idNumber]);

  const photoSrc = data?.photoUrl
    ? (data.photoUrl.startsWith('http') ? data.photoUrl : `${BASE_URL}${data.photoUrl}`)
    : null;

  const fullNameAm = data?.fullNameAmharic ||
    [data?.titleAm, data?.firstNameAm, data?.lastNameAm].filter(Boolean).join(' ');

  return (
    <div className="pv-wrapper">
      <div className="pv-container">
        {/* Header */}
        <div className="pv-header">
          <img src="/logo.png" alt="Scripture Union Ethiopia" className="pv-header-logo" />
          <div>
            <h2>Scripture Union Ethiopia</h2>
            <p>Staff Identity Verification · የሠራተኛ መታወቂያ ማረጋገጫ</p>
          </div>
        </div>

        <div className="pv-content">
          {loading && (
            <div className="pv-loading">
              <div className="pv-spinner" />
              <p>Verifying ID…</p>
            </div>
          )}

          {!loading && notFound && (
            <div className="pv-not-found">
              <span className="pv-icon-huge">🔍</span>
              <h3>NOT FOUND</h3>
              <p>No staff record matches ID <strong>{idNumber}</strong>.</p>
              <p>Please confirm the ID and try again.</p>
            </div>
          )}

          {!loading && data && (
            <div className="pv-card">
              {/* Status Banner */}
              {data.isActive ? (
                <div className="pv-status pv-valid">
                  <span>✓</span> VALID ACTIVE CREDENTIAL · ትክክለኛ ማረጋገጫ
                </div>
              ) : (
                <div className="pv-status pv-invalid">
                  <div className="pv-invalid-icon">✕</div>
                  <div>
                    <div className="pv-invalid-title">INVALID / INACTIVE</div>
                    <div className="pv-invalid-sub">ተቀባይነት የሌለው · This credential is no longer active.</div>
                  </div>
                </div>
              )}

              {/* Profile */}
              <div className="pv-profile">
                {photoSrc ? (
                  <img src={photoSrc} alt={data.full_name} className="pv-photo" />
                ) : (
                  <div className="pv-photo-placeholder">
                    {data.full_name.charAt(0)}
                  </div>
                )}

                <div className="pv-name-block">
                  {fullNameAm && <h3 className="pv-name-am">{fullNameAm}</h3>}
                  <h3 className="pv-name-en">
                    {data.title && <span>{data.title} </span>}
                    {data.full_name}
                  </h3>
                  {data.roleAmharic && <p className="pv-role-am">{data.roleAmharic}</p>}
                  <p className="pv-role-en">{data.role.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="pv-details">
                <div className="pv-detail-item">
                  <span className="pv-detail-label">ID Number</span>
                  <span className="pv-detail-value pv-id-chip">{data.idNumber}</span>
                </div>
                <div className="pv-detail-item">
                  <span className="pv-detail-label">Department / Area</span>
                  <div className="pv-detail-dual">
                    <span className="pv-detail-value">{data.department}</span>
                    {data.departmentAm && <span className="pv-detail-sub">{data.departmentAm}</span>}
                  </div>
                </div>
                <div className="pv-detail-item">
                  <span className="pv-detail-label">Office</span>
                  <span className="pv-detail-value">{data.officeAddress || 'HEAD OFFICE / ዋና ቢሮ'}</span>
                </div>
                <div className="pv-detail-item">
                  <span className="pv-detail-label">Nationality</span>
                  <span className="pv-detail-value">{data.nationality || 'ETHIOPIAN / ኢትዮጵያዊ'}</span>
                </div>
                {data.phone && (
                  <div className="pv-detail-item">
                    <span className="pv-detail-label">Phone</span>
                    <span className="pv-detail-value">{data.phone}</span>
                  </div>
                )}
                <div className="pv-detail-item">
                  <span className="pv-detail-label">Issued</span>
                  <span className="pv-detail-value">{formatDate(data.issueDate)}</span>
                </div>
                <div className="pv-detail-item">
                  <span className="pv-detail-label">Expires</span>
                  <span className="pv-detail-value">{formatDate(data.expireDate)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pv-footer">
          <p>Verified by Scripture Union Ethiopia · <a href="https://suethiopia.org" className="pv-link">suethiopia.org</a></p>
        </div>
      </div>
    </div>
  );
}
