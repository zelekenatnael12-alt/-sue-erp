import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { useWizard } from '../context/WizardContext';
import { OFFICIAL_TEMPLATE_CATEGORIES } from '../utils/templateData';
import './Step1.css';
import './Step5.css';

const Step5 = () => {
  const navigate = useNavigate();
  const { data } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) return;
    setIsSubmitting(true);
    
    try {
      // Send the real accumulated context state through the API
      const draft = await api.saveDraft(data as any);

      if (draft.id) {
        // Finalize it
        await api.submitPlan(draft.id);
        
        setSubmitSuccess(true);
        setTimeout(() => navigate('/'), 2000); // Redirect to dashboard
      }
    } catch (err) {
      console.error('Submission failed', err);
      alert('Submission failed. Check backend console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
     return (
        <div className="wizard-step5 success-view">
           <div className="success-icon">
              <span className="material-symbols-outlined">check_circle</span>
           </div>
           <h2>Plan Submitted Successfully!</h2>
           <p>Your regional plan has been sent for review.</p>
           <p className="redirect-text">Redirecting to Dashboard...</p>
        </div>
     );
  }

  return (
    <div className="wizard-step5">
      <div className="step-intro mb-8">
        <p className="section-description italic-text">Almost there! Review your final details and submit.</p>
      </div>

      {/* Dynamic Budget Summary */}
      <section className="form-section mb-10">
        <div className="form-section__header flex-start mb-4">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          <h2 className="text-xl font-bold ml-2">አጠቃላይ የበጀት እቅድ (Total Budget Allocation)</h2>
        </div>
        
        <div className="table-responsive card-panel-no-padding">
          <table className="form-table theme-override">
            <thead>
              <tr>
                <th>Category / ክፍል</th>
                <th className="text-right">Allocated Budget (ETB)</th>
              </tr>
            </thead>
            <tbody>
              {OFFICIAL_TEMPLATE_CATEGORIES.map(cat => {
                 const categoryTotal = data.matrixActivities
                    .filter(a => a.category === cat.id)
                    .reduce((sum, a) => sum + (a.budgetRequired || 0), 0);
                 
                 if (categoryTotal === 0) return null;
                 
                 return (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td className="text-right font-medium">{categoryTotal.toLocaleString()}</td>
                    </tr>
                 );
              })}
              {data.matrixActivities.reduce((sum, a) => sum + (a.budgetRequired || 0), 0) === 0 && (
                <tr>
                  <td colSpan={2} className="text-center text-muted py-4">No budget allocated in the matrix yet.</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="total-row total-row--dark">
                <td>TOTAL ANNUAL BUDGET</td>
                <td className="text-right text-lg">
                   {data.matrixActivities.reduce((sum, a) => sum + (a.budgetRequired || 0), 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Final Submission Checklist */}
      <section className="form-section mb-12">
        <div className="form-section__header flex-start mb-4">
          <span className="material-symbols-outlined text-primary">fact_check</span>
          <h2 className="text-xl font-bold ml-2">Submission Checklist</h2>
        </div>
        
        <div className="checklist-panel">
          <div className="checkbox-item">
            <input type="checkbox" className="form-checkbox" />
            <label>I have reviewed all sections of the annual plan for accuracy and completeness.</label>
          </div>
          <div className="checkbox-item">
            <input type="checkbox" className="form-checkbox" />
            <label>The budget totals align with the departmental resource allocation limits.</label>
          </div>
          <div className="checkbox-item">
            <input 
              type="checkbox" 
              className="form-checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label>I understand that once submitted, this plan will undergo formal administrative review.</label>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="form-actions mt-8">
        <button 
           type="button"
           className="btn btn--primary btn--large" 
           onClick={handleSubmit} 
           disabled={!agreed || isSubmitting}
        >
           {isSubmitting ? 'Submitting...' : 'Submit Final Plan'}
        </button>
      </div>
    </div>
  );
};

export default Step5;
