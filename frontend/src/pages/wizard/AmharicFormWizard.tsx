import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AmharicFormWizard.css';

interface FormProps {
  mode: 'PLAN' | 'REPORT';
}

// ─── Typed State ───────────────────────────────────────────────────────────
type NumVal = number | '';

interface ActivityRow {
  target: NumVal;
  actual: NumVal;
  location: string;
}
interface MissionRow {
  target: NumVal;
  actual: NumVal;
  heard_gospel: NumVal;
  students_accepted: NumVal;
  others_accepted: NumVal;
}

interface FormState {
  reporting_month: string;
  academic_year: string;
  // Module 1
  total_high_schools: NumVal;
  schools_with_su: NumVal;
  schools_without_su: NumVal;
  secondary_with_su: NumVal;
  full_time_staff: NumVal;
  associate_staff: NumVal;
  // Module 2
  m2_f1: ActivityRow;
  m2_f2: ActivityRow;
  m2_f3: ActivityRow;
  m2_f4: ActivityRow;
  m2_f5: ActivityRow;
  // Module 3
  m3_f1: NumVal; m3_f2: NumVal; m3_f3: NumVal;
  m3_f4: NumVal; m3_f5: NumVal; m3_f6: NumVal;
  // Module 4 Missions
  m4_m1: MissionRow; m4_m2: MissionRow;
  m4_m3: MissionRow; m4_m4: MissionRow;
  // Module 4 Seminars / Conferences
  m4_s1: NumVal;
  m4_c1: NumVal; m4_c2: NumVal; m4_c3: NumVal; m4_c4: NumVal;
  // Module 5
  m5_f1: NumVal; m5_f2: NumVal; m5_f3: NumVal; m5_f4: NumVal;
  m5_f5: NumVal; m5_f6: NumVal; m5_f7: NumVal; m5_f8: NumVal;
  // Module 6
  m6_f1: NumVal; m6_f2: NumVal; m6_f3: NumVal; m6_f4: NumVal;
  m6_f5: NumVal; m6_f6: NumVal; m6_f7: NumVal; m6_f8: NumVal;
  // Module 7 (Report only)
  budget_spent: NumVal;
  prayer_requests: string;
  transforming_story: string;
}

const defaultActivity = (): ActivityRow => ({ target: '', actual: '', location: '' });
const defaultMission = (): MissionRow => ({ target: '', actual: '', heard_gospel: '', students_accepted: '', others_accepted: '' });

const MONTHS = ['Meskerem','Tikimt','Hidar','Tahsas','Tir','Yekatit','Megabit','Miazia','Ginbot','Sene','Hamle','Nehase','Pagume'];

export default function AmharicFormWizard({ mode }: FormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isReport = mode === 'REPORT';
  
  // Accordion State
  const [activeStep, setActiveStep] = useState<number>(1);
  
  // Plan State (for auto-filling targets)
  const [activePlan, setActivePlan] = useState<any>(null);

  // Loading / Notification State
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Typed Form State (Initialized as empty strings)
  const [form, setForm] = useState<FormState>({
    reporting_month: 'Tikimt',
    academic_year: '',
    total_high_schools: '', schools_with_su: '', schools_without_su: '',
    secondary_with_su: '', full_time_staff: '', associate_staff: '',
    m2_f1: defaultActivity(), m2_f2: defaultActivity(), m2_f3: defaultActivity(),
    m2_f4: defaultActivity(), m2_f5: defaultActivity(),
    m3_f1: '', m3_f2: '', m3_f3: '', m3_f4: '', m3_f5: '', m3_f6: '',
    m4_m1: defaultMission(), m4_m2: defaultMission(),
    m4_m3: defaultMission(), m4_m4: defaultMission(),
    m4_s1: '',
    m4_c1: '', m4_c2: '', m4_c3: '', m4_c4: '',
    m5_f1: '', m5_f2: '', m5_f3: '', m5_f4: '', m5_f5: '', m5_f6: '', m5_f7: '', m5_f8: '',
    m6_f1: '', m6_f2: '', m6_f3: '', m6_f4: '', m6_f5: '', m6_f6: '', m6_f7: '', m6_f8: '',
    budget_spent: '', prayer_requests: '', transforming_story: '',
  });

  // Fetch approved plan on mount
  React.useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/plan/my', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('sue_token')}` }
        });
        const plans = await res.json();
        const approved = plans.find((p: any) => p.status === 'APPROVED');
        if (approved) setActivePlan(approved);
      } catch (e) {
        console.error('Failed to fetch plan:', e);
      }
    };
    fetchPlan();
  }, []);

  const getTargetByMonth = (activityName: string, month: string) => {
    if (!activePlan || !activePlan.matrixActivities) return 0;
    const act = activePlan.matrixActivities.find((a: any) => a.activity === activityName);
    if (!act) return 0;
    
    // Map Amharic month name to m1-m12
    const monthIndex = MONTHS.indexOf(month);
    if (monthIndex === -1 || monthIndex > 11) return act.target || 0; // fallback to annual if pagume or not found
    const key = `m${monthIndex + 1}`;
    return act[key] || 0;
  };

  // Sync targets when month changes
  React.useEffect(() => {
    if (isReport && activePlan) {
      const updateTargets = (prev: FormState): FormState => {
        const next = { ...prev };
        next.m2_f1 = { ...next.m2_f1, target: getTargetByMonth('አዳዲስ የኃይስኩል ሕብረቶችን ማደራጀት', form.reporting_month) };
        next.m2_f2 = { ...next.m2_f2, target: getTargetByMonth('ቀድመው የተደራጁ ነገር ግን በኤስ.ዩ ያልተያዙ ሕብረቶች በኤስ.ዩ አገልግሎት እንዲታቀፉ ማድረግ', form.reporting_month) };
        next.m2_f3 = { ...next.m2_f3, target: getTargetByMonth('ቢሮ በሚገኝበት ከተማ ውስጥ የሚገኙ የኃይስኩል ፌሎሽፖችን መጎብኘት', form.reporting_month) };
        next.m2_f4 = { ...next.m2_f4, target: getTargetByMonth('በክልሉ በሚገኙ ከተሞች ውስጥ የሚገኙ የኃይስኩል ሕብረቶችን ሄዶ መጎብኘት', form.reporting_month) };
        next.m2_f5 = { ...next.m2_f5, target: getTargetByMonth('ከአካባቢያዊ ቢሮ አስተባባሪዎችና የት/ት ቤት ሕብረት አገልጋዮች ጋር በኦንላይን የሚደረጉ ቋሚ ስብሰባዎች', form.reporting_month) };
        
        // Module 4 Missions
        next.m4_m1 = { ...next.m4_m1, target: getTargetByMonth('በሴሚስተር ዕረፍት የሚካሄድ የወንጌል ተልዕኮ (Break-Mission)', form.reporting_month) };
        next.m4_m2 = { ...next.m4_m2, target: getTargetByMonth('በትምህርት ማጠናቀቂያ የሚካሄድ የወንጌል ተልዕኮ (Summer Mission)', form.reporting_month) };
        next.m4_m3 = { ...next.m4_m3, target: getTargetByMonth('አጫጭር የወንጌል የምስክርነት ፕሮግራሞች (Mini-missions)', form.reporting_month) };
        next.m4_m4 = { ...next.m4_m4, target: getTargetByMonth('መሠረታዊ የክርስትና ት/ት ማስተማር', form.reporting_month) };
        
        // Simple numeric fields (Seminars, Admin, etc.)
        next.m4_s1 = getTargetByMonth('ILI / TNT / Worldview / BSM / Mission Seminars', form.reporting_month);
        next.m4_c1 = getTargetByMonth('የወንጌል ተልዕኮ ተኮር ጉባኤ', form.reporting_month);
        next.m4_c2 = getTargetByMonth('ደቀመዝሙር ተኮር ጉባኤ', form.reporting_month);
        next.m4_c3 = getTargetByMonth('መሪነት ላይ ያተኮረ ጉባኤ', form.reporting_month);
        next.m4_c4 = getTargetByMonth('በተመረጡ አርዕስተ ጉዳዮች ላይ ያተኮረ ጉባኤ', form.reporting_month);
        
        return next;
      };
      setForm(prev => updateTargets(prev));
    }
  }, [form.reporting_month, activePlan, isReport]);

  const setField = (key: keyof FormState, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const setActivity = (key: keyof FormState, field: keyof ActivityRow, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: { ...(prev[key] as ActivityRow), [field]: value } }));

  const setMission = (key: keyof FormState, field: keyof MissionRow, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: { ...(prev[key] as MissionRow), [field]: value } }));

  const numVal = (v: NumVal) => (v === '' ? 0 : Number(v));

  // ─── Build Payload ──────────────────────────────────────────────────────
  const buildPayload = () => {
    const activityEntry = (activity: string, row: ActivityRow) => ({
      activity,
      target: numVal(row.target),
      actual: isReport ? numVal(row.actual) : undefined,
      location: isReport ? row.location : undefined,
      variance_note: isReport && numVal(row.actual) < numVal(row.target) ? `Shortfall of ${numVal(row.target) - numVal(row.actual)}` : '',
    });

    const missionEntry = (activity: string, row: MissionRow) => ({
      activity,
      target: numVal(row.target),
      actual: isReport ? numVal(row.actual) : undefined,
      ...(isReport ? {
        impact_metrics: {
          heard_gospel: numVal(row.heard_gospel),
          students_accepted_jesus: numVal(row.students_accepted),
          others_accepted_jesus: numVal(row.others_accepted),
        }
      } : {}),
    });

    const simpleArr = (activity: string, val: NumVal) => ({
      activity, target: numVal(val), actual: isReport ? numVal(val) : undefined,
    });

    const innerPayload = {
      module_1_general: {
        total_high_schools: numVal(form.total_high_schools),
        schools_with_su: numVal(form.schools_with_su),
        schools_without_su: numVal(form.schools_without_su),
        secondary_with_su: numVal(form.secondary_with_su),
        full_time_staff: numVal(form.full_time_staff),
        associate_staff: numVal(form.associate_staff),
      },
      module_2_organizing: [
        activityEntry('አዳዲስ የኃይስኩል ሕብረቶችን ማደራጀት', form.m2_f1),
        activityEntry('ቀድመው የተደራጁ ነገር ግን በኤስ.ዩ ያልተያዙ ሕብረቶች', form.m2_f2),
        activityEntry('ቢሮ በሚገኝበት ከተማ ፌሎሽፖችን መጎብኘት', form.m2_f3),
        activityEntry('በክልሉ ሕብረቶችን ሄዶ መጎብኘት', form.m2_f4),
        activityEntry('በኦንላይን ቋሚ ስብሰባዎች', form.m2_f5),
      ],
      module_3_teachings: [
        simpleArr('SU Core Teachings', form.m3_f1),
        simpleArr('Character formation ስልጠናዎች', form.m3_f2),
        simpleArr('Biblical Leadership Training', form.m3_f3),
        simpleArr('A-HLS', form.m3_f4),
        simpleArr('R-HLS', form.m3_f5),
        simpleArr('ለ 12 ክፍል ተፈታኞች ልዩ ስልጠና', form.m3_f6),
      ],
      module_4_missions: [
        missionEntry('Break-Mission', form.m4_m1),
        missionEntry('Summer Mission', form.m4_m2),
        missionEntry('Mini-missions', form.m4_m3),
        missionEntry('መሠረታዊ የክርስትና ት/ት ማስተማር', form.m4_m4),
      ],
      module_4_seminars_conferences: [
        simpleArr('ILI / TNT / Worldview / BSM / Mission Seminars', form.m4_s1),
        simpleArr('የወንጌል ተልዕኮ ተኮር ጉባኤ', form.m4_c1),
        simpleArr('ደቀመዝሙር ተኮር ጉባኤ', form.m4_c2),
        simpleArr('መሪነት ላይ ያተኮረ ጉባኤ', form.m4_c3),
        simpleArr('በተመረጡ አርዕስተ ጉዳዮች ላይ ያተኮረ ጉባኤ', form.m4_c4),
      ],
      module_5_partnerships: [
        simpleArr('ከአጥቢያ ቤ/ክ ጋር ፕሮግራም/ስልጠና', form.m5_f1),
        simpleArr('ከተማሪ ወላጆች ጋር ፕሮግራም/ስልጠና', form.m5_f2),
        simpleArr('ከአብያተክርስቲያናት ሕብረት ጋር ፕሮግራም', form.m5_f3),
        simpleArr('ከአጋር መንፈሳዊ ተቋማት ጋር ፕሮግራም/ስልጠና', form.m5_f4),
        simpleArr('ከማሕበራዊ ተቋማት/ግለሰቦች ጋር ፕሮግራም', form.m5_f5),
        simpleArr('ቋሚ ድጋፍ አጥቢያ ቤ/ክ ማፈላለግ', form.m5_f6),
        simpleArr('አንድ ጊዜ ስጦታ አጥቢያ ቤ/ክ ማፈላለግ', form.m5_f7),
        simpleArr('Personal Support Raise', form.m5_f8),
      ],
      module_6_admin: [
        simpleArr('የሙሉ ጊዜ አገልጋዮችን መመልመል', form.m6_f1),
        simpleArr('ቢሮ ፍላጎትን ማሟላት', form.m6_f2),
        simpleArr('ለቢሮ አገልግሎት መሣሪያዎች', form.m6_f3),
        simpleArr('ለስልጠና አጋዥ መሣሪያዎች', form.m6_f4),
        simpleArr('ለአገልጋይ መጓጓዣ', form.m6_f5),
        simpleArr('በጎ ፈቃደኛ አገልጋዮች', form.m6_f6),
        simpleArr('ሪፖርትና መረጃ ማዘጋጀት', form.m6_f7),
        simpleArr('SU Staff Self-development', form.m6_f8),
      ],
      ...(isReport ? {
        module_7_qualitative: {
          budget_spent: numVal(form.budget_spent),
          prayer_requests: form.prayer_requests,
          transforming_story: form.transforming_story,
        }
      } : {}),
    };

    return {
      document_type: isReport ? 'MONTHLY_REPORT' : 'ANNUAL_PLAN',
      reporting_month: isReport ? form.reporting_month : undefined,
      academic_year: form.academic_year,
      location_id: (user as any)?.locationId || null,
      [isReport ? 'actuals_payload' : 'metrics_payload']: innerPayload,
    };
  };

  // ─── Submit Handler ─────────────────────────────────────────────────────
  const submitForm = async () => {
    setSubmitting(true);
    setNotification(null);
    const payload = buildPayload();

    try {
      const token = localStorage.getItem('sue_token');
      const res = await fetch('http://localhost:3001/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error: ${res.status}`);

      setNotification({ type: 'success', message: isReport ? 'Monthly Report submitted successfully!' : 'Annual Plan submitted successfully!' });
      const destination =
        user?.role === 'AREA_STAFF' ? '/area' :
        user?.role === 'SUB_REGIONAL' ? '/sub-regional' : '/regional';
      setTimeout(() => navigate(destination), 1800);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => setActiveStep(prev => Math.min(prev + 1, isReport ? 7 : 6));
  const handlePrev = () => setActiveStep(prev => Math.max(prev - 1, 1));
  const lastStep = isReport ? 7 : 6;

  // ─── Helpers ────────────────────────────────────────────────────────────
  const NumInput = ({ label, value, onChange }: { label: string; value: NumVal; onChange: (v: NumVal) => void }) => (
    <div className="aw-form-row">
      <label className="aw-form-label">{label}</label>
      <input 
        type="number" 
        className="aw-input" 
        min={0} 
        value={value} 
        onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} 
        placeholder="0"
      />
    </div>
  );

  const ActivityInput = ({ label, fkey }: { label: string; fkey: keyof FormState }) => {
    const row = form[fkey] as ActivityRow;
    if (!isReport) {
      return (
        <div className="aw-form-row aw-grid-plan">
          <label className="aw-form-label">{label}</label>
          <input type="number" className="aw-input" placeholder="0" min={0}
            value={row.target} onChange={e => setActivity(fkey, 'target', e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
      );
    }
    return (
      <div className="aw-ta-card">
        <label className="aw-form-label">{label}</label>
        <div className="aw-ta-grid">
          <div className="aw-ta-item">
            <span>Target ({isReport ? 'From Plan' : 'Target'})</span>
            <input type="number" className="aw-input" min={0} value={row.target} placeholder="0"
              readOnly={isReport && !!activePlan}
              onChange={e => setActivity(fkey, 'target', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div className="aw-ta-item">
            <span>Actual</span>
            <input type="number" className="aw-input" min={0} value={row.actual} placeholder="0"
              onChange={e => setActivity(fkey, 'actual', e.target.value === '' ? '' : Number(e.target.value))} />
            {numVal(row.actual) > 0 && numVal(row.actual) < numVal(row.target) && (
              <span className="aw-variance-tag">▼ Shortfall of {numVal(row.target) - numVal(row.actual)}</span>
            )}
          </div>
          <div className="aw-ta-item aw-ta-loc">
            <span>የዞን/የወረዳ ከተማ (Location)</span>
            <input type="text" className="aw-input" value={row.location} placeholder="Location name..."
              onChange={e => setActivity(fkey, 'location', e.target.value)} />
          </div>
        </div>
      </div>
    );
  };

  const MissionInput = ({ label, fkey }: { label: string; fkey: keyof FormState }) => {
    const row = form[fkey] as MissionRow;
    return (
      <div className="aw-mission-card">
        <label className="aw-form-label">{label}</label>
        <div className="aw-ta-grid" style={{ marginTop: '0.5rem' }}>
          <div className="aw-ta-item">
            <span>Target ({isReport ? 'From Plan' : 'Target'})</span>
            <input type="number" className="aw-input" min={0} value={row.target} placeholder="0"
              readOnly={isReport && !!activePlan}
              onChange={e => setMission(fkey, 'target', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          {isReport && (
            <div className="aw-ta-item">
              <span>Actual</span>
              <input type="number" className="aw-input" min={0} value={row.actual} placeholder="0"
                onChange={e => setMission(fkey, 'actual', e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
          )}
        </div>
        {isReport && (
          <div className="aw-mission-metrics">
            <div className="aw-miss-row">
              <span className="aw-miss-lbl">ወንጌልን የሰሙ ሰዎች ብዛት</span>
              <input type="number" className="aw-input" min={0} value={row.heard_gospel} placeholder="0"
                onChange={e => setMission(fkey, 'heard_gospel', e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="aw-miss-row">
              <span className="aw-miss-lbl">ጌታን የተቀበሉ ተማሪዎች ብዛት</span>
              <input type="number" className="aw-input" min={0} value={row.students_accepted} placeholder="0"
                onChange={e => setMission(fkey, 'students_accepted', e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="aw-miss-row">
              <span className="aw-miss-lbl">ጌታን የተቀበሉ ሌሎች ሰዎች ብዛት</span>
              <input type="number" className="aw-input" min={0} value={row.others_accepted} placeholder="0"
                onChange={e => setMission(fkey, 'others_accepted', e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const Acc = ({ step, title, children }: { step: number; title: string; children: React.ReactNode }) => {
    const isActive = step === activeStep;
    const isCompleted = step < activeStep;
    return (
      <div className={`aw-acc ${isActive ? 'aw-acc-active' : ''} ${isCompleted ? 'aw-acc-completed' : ''}`}>
        <div className="aw-acc-header" onClick={() => setActiveStep(step)}>
          <div className="aw-acc-num">
            {isCompleted
              ? <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
              : step}
          </div>
          <h3 className="aw-acc-title">{title}</h3>
          <span className="material-symbols-outlined aw-acc-chevron">expand_more</span>
        </div>
        {isActive && (
          <div className="aw-acc-body">
            {children}
            <div className="aw-acc-actions">
              {step > 1 && <button className="aw-btn aw-btn-outline" onClick={handlePrev}>Back</button>}
              {step < lastStep
                ? <button className="aw-btn aw-btn-primary" onClick={handleNext}>Next Section</button>
                : <button className="aw-btn aw-btn-success" onClick={submitForm} disabled={submitting}>
                    {submitting
                      ? <><span className="aw-spinner" />Submitting...</>
                      : `Submit ${isReport ? 'Report' : 'Annual Plan'}`}
                  </button>
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  const dashUrl =
    user?.role === 'AREA_STAFF' ? '/area' :
    user?.role === 'SUB_REGIONAL' ? '/sub-regional' : '/regional';

  return (
    <div className="aw-container">

      {/* Notification Banner */}
      {notification && (
        <div className={`aw-notification aw-notification--${notification.type}`}>
          <span className="material-symbols-outlined">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {notification.message}
          <button className="aw-notif-close" onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="aw-header">
        <button className="aw-back" onClick={() => navigate(dashUrl)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="aw-header-content">
          <h1>{isReport ? 'Monthly Report Form' : 'Annual Master Plan'}</h1>
          <p className="aw-subtitle">{user?.region || 'Not Assigned'} — {user?.name}</p>
        </div>
        <div className={`aw-header-badge aw-header-badge--${mode.toLowerCase()}`}>
          {isReport ? 'REPORTING MODE' : 'PLANNING MODE'}
        </div>
      </div>

      {/* Meta Row: Month + Year selectors */}
      <div className="aw-meta-row">
        {isReport && (
          <div className="aw-meta-field">
            <label>Reporting Month</label>
            <select className="aw-input" value={form.reporting_month}
              onChange={e => setField('reporting_month', e.target.value)}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        )}
        <div className="aw-meta-field">
          <label>Academic Year (E.C.)</label>
          <input type="text" className="aw-input" value={form.academic_year}
            onChange={e => setField('academic_year', e.target.value)} placeholder="e.g. 2017" />
        </div>
      </div>

      {/* Wizard */}
      <div className="aw-wizard">

        {/* 1 */}
        <Acc step={1} title="አጠቃላይ መረጃ (General Information)">
          <div className="aw-fieldset">
            <NumInput label="በክልላዊ/አካባቢያዊ ቢሮ የሚገኙ አጠቃላይ የኃይስኩል ትምህርት ቤቶች ብዛት" value={form.total_high_schools} onChange={v => setField('total_high_schools', v)} />
            <NumInput label="የክርስቲያን ተማሪዎች ሕብረት ያላቸው ኃይስኩሎች ብዛት" value={form.schools_with_su} onChange={v => setField('schools_with_su', v)} />
            <NumInput label="የክርስቲያን ተማሪዎች ሕብረት የሌላቸው ኃይስኩሎች ብዛት" value={form.schools_without_su} onChange={v => setField('schools_without_su', v)} />
            <NumInput label="የክርስቲያን ተማሪዎች ሕብረት ያላቸው የመለስተኛ 2ኛ ደረጃ ት/ት ቤት ብዛት" value={form.secondary_with_su} onChange={v => setField('secondary_with_su', v)} />
            <NumInput label="በክልሉ/አካባቢው የሙሉ ጊዜ አገልጋዮች ብዛት" value={form.full_time_staff} onChange={v => setField('full_time_staff', v)} />
            <NumInput label="በክልሉ/አካባቢው የአሶሼትስ አገልጋዮች ብዛት" value={form.associate_staff} onChange={v => setField('associate_staff', v)} />
          </div>
        </Acc>

        {/* 2 */}
        <Acc step={2} title="ማደራጀት፣ ጉብኝት እና ክትትል (Organizing & Visiting)">
          <div className="aw-fieldset">
            <ActivityInput label="አዳዲስ የኃይስኩል ሕብረቶችን ማደራጀት" fkey="m2_f1" />
            <ActivityInput label="ቀድመው የተደራጁ ነገር ግን በኤስ.ዩ ያልተያዙ ሕብረቶች በኤስ.ዩ አገልግሎት እንዲታቀፉ ማድረግ" fkey="m2_f2" />
            <ActivityInput label="ቢሮ በሚገኝበት ከተማ ውስጥ የሚገኙ የኃይስኩል ፌሎሽፖችን መጎብኘት" fkey="m2_f3" />
            <ActivityInput label="በክልሉ በሚገኙ ከተሞች ውስጥ የሚገኙ የኃይስኩል ሕብረቶችን ሄዶ መጎብኘት" fkey="m2_f4" />
            <ActivityInput label="ከአካባቢያዊ ቢሮ አስተባባሪዎችና የት/ት ቤት ሕብረት አገልጋዮች ጋር በኦንላይን የሚደረጉ ቋሚ ስብሰባዎች" fkey="m2_f5" />
          </div>
        </Acc>

        {/* 3 */}
        <Acc step={3} title="ትምህርትና ሥልጠና (Teachings & Training)">
          <div className="aw-fieldset">
            <NumInput label="የኃይስኩል ፌሎሽፕ መሰረታዊ ትምህርቶች (SU Core Teachings)" value={form.m3_f1} onChange={v => setField('m3_f1', v)} />
            <NumInput label="የደቀመዝሙር (Character formation) ትምህርቶች/ስልጠናዎች" value={form.m3_f2} onChange={v => setField('m3_f2', v)} />
            <NumInput label="ከመሪነት ጋር የተገናኙ ስልጠናዎች (Biblical Leadership Training)" value={form.m3_f3} onChange={v => setField('m3_f3', v)} />
            <NumInput label="አካባቢያዊ የተማሪ መሪዎች ስልጠና (A-HLS)" value={form.m3_f4} onChange={v => setField('m3_f4', v)} />
            <NumInput label="ክልላዊ የተማሪ መሪዎች ስልጠና (R-HLS)" value={form.m3_f5} onChange={v => setField('m3_f5', v)} />
            <NumInput label="ለ 12 ክፍል ተፈታኞች የሚሰጥ ልዩ ስልጠና" value={form.m3_f6} onChange={v => setField('m3_f6', v)} />
          </div>
        </Acc>

        {/* 4 */}
        <Acc step={4} title="የወንጌል ተልዕኮ እና ሴሚናሮች (Missions, Seminars & Conferences)">
          <div className="aw-fieldset">
            <h4 className="aw-subheading">የወንጌል ተልዕኮ (Missions)</h4>
            <MissionInput label="በሴሚስተር ዕረፍት የሚካሄድ የወንጌል ተልዕኮ (Break-Mission)" fkey="m4_m1" />
            <MissionInput label="በትምህርት ማጠናቀቂያ የሚካሄድ የወንጌል ተልዕኮ (Summer Mission)" fkey="m4_m2" />
            <MissionInput label="አጫጭር የወንጌል የምስክርነት ፕሮግራሞች (Mini-missions)" fkey="m4_m3" />
            <MissionInput label="መሠረታዊ የክርስትና ት/ት ማስተማር" fkey="m4_m4" />

            <h4 className="aw-subheading aw-mt-6">ሴሚናሮች (Seminars)</h4>
            <NumInput label="ILI, TNT, Worldview, BSM (Bible Study Method), Manuscript, Mission Seminars, All School Conferences" value={form.m4_s1} onChange={v => setField('m4_s1', v)} />

            <h4 className="aw-subheading aw-mt-6">መንፈሳዊ ጉባኤያት (Conferences)</h4>
            <NumInput label="የወንጌል ተልዕኮ ተኮር ጉባኤ" value={form.m4_c1} onChange={v => setField('m4_c1', v)} />
            <NumInput label="ደቀመዝሙር ተኮር ጉባኤ" value={form.m4_c2} onChange={v => setField('m4_c2', v)} />
            <NumInput label="መሪነት ላይ ያተኮረ ጉባኤ" value={form.m4_c3} onChange={v => setField('m4_c3', v)} />
            <NumInput label="በተመረጡ አርዕስተ ጉዳዮች ላይ ያተኮረ ጉባኤ" value={form.m4_c4} onChange={v => setField('m4_c4', v)} />
          </div>
        </Acc>

        {/* 5 */}
        <Acc step={5} title="የአጋርነት እና ሐብት ማሰባሰብ (Partnerships & Resource Mobilization)">
          <div className="aw-fieldset">
            <NumInput label="ከአጥቢያ ቤ/ክ ጋር የሚካሄድ ፕሮግራም/ስልጠና" value={form.m5_f1} onChange={v => setField('m5_f1', v)} />
            <NumInput label="ከተማሪ ወላጆች ጋር የሚካሄድ ፕሮግራም/ስልጠና" value={form.m5_f2} onChange={v => setField('m5_f2', v)} />
            <NumInput label="ከአብያተክርስቲያናት ሕብረት ጋር የሚካሄድ ፕሮግራም" value={form.m5_f3} onChange={v => setField('m5_f3', v)} />
            <NumInput label="ከአጋር መንፈሳዊ ተቋማት ጋር የሚካሄድ ፕሮግራም/ስልጠና" value={form.m5_f4} onChange={v => setField('m5_f4', v)} />
            <NumInput label="በከተማው ከሚገኙ ማሕበራዊ ተቋማት/ግለሰቦች ጋር የሚካሄድ ፕሮግራም" value={form.m5_f5} onChange={v => setField('m5_f5', v)} />
            <NumInput label="በቋሚነት አገልግሎቱን የሚደግፉ አጥቢያ ቤ/ክ፣ አጋር ተቋማት፣ አጋር ግለሰቦችን ማፈላለግ" value={form.m5_f6} onChange={v => setField('m5_f6', v)} />
            <NumInput label="በአንድ ጊዜ ስጦታ አገልግሎቱን የሚደግፉ አጥቢያ ቤ/ክ፣ አጋር ተቋማት፣ አጋር ግለሰቦችን ማፈላለግ" value={form.m5_f7} onChange={v => setField('m5_f7', v)} />
            <NumInput label="የአገልግሎት የገንዘብ ድጋፍ ማሰባሰብ (Personal Support Raise)" value={form.m5_f8} onChange={v => setField('m5_f8', v)} />
          </div>
        </Acc>

        {/* 6 */}
        <Acc step={6} title="ቢሮ ማደራጀት እና የስታፍ መረጃ (Admin, Volunteers & Staff Life)">
          <div className="aw-fieldset">
            <NumInput label="የሙሉ ጊዜ የተማሪ አገልጋዮችን መመልመል" value={form.m6_f1} onChange={v => setField('m6_f1', v)} />
            <NumInput label="ክልላዊና አከባቢያዊ የቢሮ ፍላጎትን በኪራይ ወይም በድጋፍ ማሟላት" value={form.m6_f2} onChange={v => setField('m6_f2', v)} />
            <NumInput label="ለቢሮ አገልግሎት የሚውሉ (ጠረጴዛ፣ ወንበር፣ ኮምፒውተር፣ ፕሪንተር…)" value={form.m6_f3} onChange={v => setField('m6_f3', v)} />
            <NumInput label="ለስልጠና አጋዥ የሆኑ መሣሪያዎች (ፍራሽና አንሶላ፣ ፕሮጀክተር፣ ነጭ ሰሌዳ)" value={form.m6_f4} onChange={v => setField('m6_f4', v)} />
            <NumInput label="ለአገልጋይ መንቀሳቀሻ የሚያገለግሉ መጓጓዣ (ሣይክል፣ ሞተር ሣይክል፣ መኪና)" value={form.m6_f5} onChange={v => setField('m6_f5', v)} />
            <NumInput label="በጎ ፈቃደኛ የኃይስኩል ተማሪዎች አገልጋዮችን መመልመልና ማሰልጠን / ማሰማራት" value={form.m6_f6} onChange={v => setField('m6_f6', v)} />
            <NumInput label="ሪፖርትና መረጃ ማዘጋጀት (ወርሃዊ ሪፖርት ማዘጋጀት፣ ዋና መሪዎች መረጃ ማጠናቀር)" value={form.m6_f7} onChange={v => setField('m6_f7', v)} />
            <NumInput label="አገልጋዩ የግል ሕይወት ግንባታ እቅድ (SU Staff Self-development)" value={form.m6_f8} onChange={v => setField('m6_f8', v)} />
          </div>
        </Acc>

        {/* 7 — Report only */}
        {isReport && (
          <Acc step={7} title="ምስክርነት እና በጀት (Testimony, Prayer & Budget)">
            <div className="aw-fieldset">
              <div className="aw-form-row">
                <label className="aw-form-label">ለተጠቀሱት ተግባራት የሚያስፈልግ/የወጣ አጠቃላይ በጀት (ETB)</label>
                <input type="number" className="aw-input" min={0} value={form.budget_spent} placeholder="0"
                  onChange={e => setField('budget_spent', e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="aw-form-row aw-mt-6">
                <label className="aw-form-label">ፀሎትና ትኩረት የሚሹ አገልግሎትና የግል ሕይወትን የተመለከቱ ጉዳዮች</label>
                <textarea className="aw-textarea" rows={4} value={form.prayer_requests}
                  onChange={e => setField('prayer_requests', e.target.value)}
                  placeholder="Prayer requests and personal matters requiring attention..." />
              </div>
              <div className="aw-form-row aw-mt-6">
                <label className="aw-form-label">ምስክርነት፡ በአገልግሎትህ የገጠማችሁን ምስክርነት ካለ አካፍሉን</label>
                <textarea className="aw-textarea" rows={6} value={form.transforming_story}
                  onChange={e => setField('transforming_story', e.target.value)}
                  placeholder="Testimonies from students, churches, partner institutions, or individuals..." />
              </div>
            </div>
          </Acc>
        )}

      </div>
    </div>
  );
}

