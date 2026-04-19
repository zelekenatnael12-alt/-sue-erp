import { useEffect, useState } from 'react';
import { api } from '../../api/api';
import { OFFICIAL_TEMPLATE_CATEGORIES } from '../../utils/templateData';
import './AdminOverview.css'; // Borrowing overview styles

const AdminAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAdminAnalytics(),
      api.getAiInsights()
    ]).then(([analytics, insights]) => {
      setData(analytics);
      setAiData(insights);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:'4rem',textAlign:'center'}}>Loading Matrix Analytics...</div>;
  if (!data || !aiData) return <div style={{padding:'4rem',textAlign:'center'}}>Failed to load Analytics</div>;

  // Let's calculate the total targets per actId so we can compare with actuals easily
  // data.allTargets is an array of PlanMatrixActivity records.
  // We need to map them back to act.id (e.g., '1.1') by matching activityName.
  const aggTargets: Record<string, number> = {};
  
  // Create a fast lookup map for activity name -> act.id
  const nameToIdLookup: Record<string, string> = {};
  OFFICIAL_TEMPLATE_CATEGORIES.forEach(cat => {
     cat.activities.forEach(act => {
        nameToIdLookup[act.name] = act.id;
     });
  });

  data.allTargets.forEach((targetRow: any) => {
     const actId = nameToIdLookup[targetRow.activityName];
     if (actId) {
        if (!aggTargets[actId]) aggTargets[actId] = 0;
        aggTargets[actId] += (
           targetRow.targetMeskerem + targetRow.targetTikimt + targetRow.targetHidar + targetRow.targetTahsas +
           targetRow.targetTir + targetRow.targetYekatit + targetRow.targetMegabit + targetRow.targetMiyazia +
           targetRow.targetGinbot + targetRow.targetSene + targetRow.targetHamle + targetRow.targetNehase
        );
     }
  });

  return (
    <div className="admin-overview" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div className="flex-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">Executive Matrix Analytics</h1>
          <p className="text-muted">Consolidated actuals vs targets from {data.totalApprovedPlans} approved regional plans.</p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={() => window.print()}>
          <span className="material-symbols-outlined mr-2">download</span> Export PDF
        </button>
      </div>

      <div className="grid-3-col mb-8">
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <p className="stat-card__label">Total High Schools</p>
              <p className="stat-card__value">{data.baselines.totalHighSchools}</p>
            </div>
            <div className="icon-square icon-square--amber">
              <span className="material-symbols-outlined">school</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t text-sm flex-col gap-2">
            <div className="flex-between w-full"><span>With SU Fellowship</span><span className="font-bold">{data.baselines.suFellowshipSchools}</span></div>
            <div className="flex-between w-full"><span>Fellowship (Not SU)</span><span className="font-bold">{data.baselines.fellowshipNotSuSchools}</span></div>
            <div className="flex-between w-full"><span>No Fellowship</span><span className="font-bold">{data.baselines.noFellowshipSchools}</span></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <div>
              <p className="stat-card__label">Human Resources</p>
              <p className="stat-card__value">{data.baselines.fullTimeStaffCount + data.baselines.associateStaffCount + data.baselines.volunteerCount}</p>
            </div>
            <div className="icon-square icon-square--primary">
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t text-sm flex-col gap-2">
            <div className="flex-between w-full"><span>Full-time Staff</span><span className="font-bold">{data.baselines.fullTimeStaffCount}</span></div>
            <div className="flex-between w-full"><span>Associate Staff</span><span className="font-bold">{data.baselines.associateStaffCount}</span></div>
            <div className="flex-between w-full"><span>Volunteers</span><span className="font-bold text-primary">{data.baselines.volunteerCount}</span></div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <p className="stat-card__label">Middle Schools Reached</p>
              <p className="stat-card__value">{data.baselines.middleSchools}</p>
            </div>
            <div className="icon-square icon-square--blue">
              <span className="material-symbols-outlined">child_care</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel mb-8 border-t-4 border-t-primary glass-panel">
        <h3 className="text-xl font-bold mb-4 flex-start gap-2">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          AI-Powered Insights
        </h3>
        <p className="text-sm text-muted mb-6">Automated analysis of regional plans and monthly reporting actuals.</p>
        
        <div className="grid-3-col gap-6">
          <div className="bg-green-50 p-4 border border-green-100 rounded-lg">
            <h4 className="font-bold text-green-800 mb-3 flex-start gap-2">
              <span className="material-symbols-outlined">trending_up</span> Strengths
            </h4>
            <ul className="text-sm text-green-900 flex-col gap-2 list-disc pl-4">
              {aiData.strengths.map((s: string, i: number) => <li key={i}><span dangerouslySetInnerHTML={{__html: s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} /></li>)}
            </ul>
          </div>
          <div className="bg-amber-50 p-4 border border-amber-100 rounded-lg">
             <h4 className="font-bold text-amber-800 mb-3 flex-start gap-2">
              <span className="material-symbols-outlined">warning</span> Focus Areas
            </h4>
             <ul className="text-sm text-amber-900 flex-col gap-2 list-disc pl-4">
              {aiData.focusAreas.map((f: string, i: number) => <li key={i}><span dangerouslySetInnerHTML={{__html: f.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} /></li>)}
             </ul>
          </div>
          <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg">
             <h4 className="font-bold text-blue-800 mb-3 flex-start gap-2">
              <span className="material-symbols-outlined">notifications_active</span> Targeted Reminders
            </h4>
             <ul className="text-sm text-blue-900 flex-col gap-3">
              {aiData.coordinatorReminders.map((r: any, i: number) => (
                <li key={i} className="bg-white p-2 border border-blue-200 rounded">
                  <div className="text-xs font-bold text-blue-600 mb-1">{r.region}</div>
                  <div>{r.reminder}</div>
                </li>
              ))}
             </ul>
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h3 className="text-xl font-bold mb-4">Official Template Performance Tracking</h3>
        <p className="text-sm text-muted mb-6">Aggregate progression of matrix targets across all approved regional plans.</p>

        <div className="flex-col gap-8">
          {OFFICIAL_TEMPLATE_CATEGORIES.map(cat => {
            // Check if this category has any targets at all to avoid rendering 15 empty tables
            const hasTargets = cat.activities.some(act => aggTargets[act.id] && aggTargets[act.id] > 0);
            if (!hasTargets) return null;

            return (
              <div key={cat.id} className="border rounded">
                <div className="bg-slate-50 p-3 font-bold text-slate-700 border-b">{cat.name}</div>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="border-b bg-slate-100 text-xs text-muted uppercase">
                      <th className="p-3 font-medium w-1/2">Activity Base</th>
                      <th className="p-3 font-medium text-right">Nat. Target</th>
                      <th className="p-3 font-medium text-right">Nat. Actuals</th>
                      <th className="p-3 font-medium text-right w-1/4">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.activities.map(act => {
                       const t = aggTargets[act.id] || 0;
                       if (t === 0) return null; // hide if zero
                       
                       const a = data.globalActuals[act.id] || 0;
                       const pct = Math.min(100, Math.round((a / t) * 100)) || 0;

                       return (
                         <tr key={act.id} className="border-b last:border-0 hover:bg-slate-50">
                           <td className="p-3 text-sm text-slate-700">{act.name}</td>
                           <td className="p-3 text-sm font-bold text-right text-slate-500">{t}</td>
                           <td className="p-3 text-sm font-bold text-right text-slate-900">{a}</td>
                           <td className="p-3">
                             <div className="flex-start gap-3 justify-end">
                               <div style={{ width: '80px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                 <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 100 ? '#10b981' : 'var(--color-primary)' }} />
                               </div>
                               <span className="text-xs font-bold text-slate-500" style={{ width: '40px', textAlign: 'right' }}>{pct}%</span>
                             </div>
                           </td>
                         </tr>
                       );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
