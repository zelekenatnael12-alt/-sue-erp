import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { OFFICIAL_TEMPLATE_CATEGORIES } from '../utils/templateData';
import './WizardLayout.css';

const WizardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useWizard();
  
  const currentStep = parseInt(location.pathname.split('step-')[1] || '1', 10);
  const progressPercent = (currentStep / 3) * 100;

  // Validation logic for Step 2
  // Make sure at least one plan is provided in EVERY category
  let isMatrixValid = true;
  if (currentStep === 2) {
    let globalActivityIndex = 0;
    
    for (const category of OFFICIAL_TEMPLATE_CATEGORIES) {
      let categoryHasPlan = false;
      const count = category.activities.length;
      
      for (let i = 0; i < count; i++) {
        const activityData = data.matrixActivities[globalActivityIndex];
        const hasBudget = activityData?.budgetRequired > 0;
        
        // check months
        const hasTargets = Object.entries(activityData || {}).some(([k, v]) => {
          if (k !== 'activityId' && k !== 'name' && k !== 'budgetRequired' && typeof v === 'number') {
            return v > 0;
          }
          return false;
        });

        if (hasBudget || hasTargets) {
          categoryHasPlan = true;
        }
        globalActivityIndex++;
      }
      
      if (!categoryHasPlan) {
        isMatrixValid = false;
        break;
      }
    }
  }

  const isNextDisabled = currentStep === 2 && !isMatrixValid;

  const handleNext = () => {
    if (isNextDisabled) {
      alert('Please allocate at least one plan (target or budget) for EVERY category in the matrix before proceeding.');
      return;
    }
    if (currentStep < 3) navigate(`/plan/step-${currentStep + 1}`);
  };

  const handlePrev = () => {
    if (currentStep > 1) navigate(`/plan/step-${currentStep - 1}`);
    else navigate('/');
  };

  const attemptStepNavigation = (step: number) => {
    if (step === 3 && currentStep === 2 && !isMatrixValid) {
      alert('Please allocate at least one plan (target or budget) for EVERY category in the matrix before proceeding.');
      return;
    }
    navigate(`/plan/step-${step}`);
  };

  return (
    <div className="wizard-layout">
      <header className="wizard-header">
        <div className="wizard-header__container">
          <div className="wizard-header__left">
            <div className="wizard-icon">
              <span className="material-symbols-outlined">magic_button</span>
            </div>
            <h1>Planning Wizard</h1>
          </div>
          
          <div className="wizard-header__right">
            <nav className="wizard-nav">
              <Link to="/" className="wizard-nav__link">Dashboard</Link>
              <Link to="/plan/step-1" className="wizard-nav__link wizard-nav__link--active">Projects</Link>
              <Link to="/reports" className="wizard-nav__link">Reports</Link>
            </nav>
            <div className="wizard-avatar"></div>
          </div>
        </div>
      </header>
      
      <main className="wizard-main">
        <div className="wizard-progress">
          <div className="wizard-progress__header">
             <div className="wizard-progress__title">
                <span className="wizard-progress__step-text">Step {currentStep} of 3</span>
                <h2>{getStepTitle(currentStep)}</h2>
             </div>
             <div className="wizard-progress__percent">
                <span>{progressPercent}% Complete</span>
             </div>
          </div>
          <div className="progress-track">
             <div className="progress-track__fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          
          <div className="progress-steps hidden-mobile">
             <div className="progress-steps__line"></div>
             {[1, 2, 3].map((step) => (
                <div 
                   key={step} 
                   className={`progress-step-item ${currentStep >= step ? 'progress-step-item--active' : ''}`}
                   onClick={() => attemptStepNavigation(step)}
                   style={{cursor: 'pointer'}}
                >
                  <div className="progress-step-item__circle">{step}</div>
                  <span className="progress-step-item__label">{getStepLabel(step)}</span>
                </div>
             ))}
          </div>
        </div>
        
        <Outlet />
        
      </main>

      <footer className="wizard-footer">
         <div className="wizard-footer__container">
            <button type="button" className="btn btn--outline btn--icon">
               <span className="material-symbols-outlined">save</span>
               Save as Draft
            </button>
            <div className="wizard-footer__actions">
               <button type="button" className="btn btn--ghost btn--icon" onClick={handlePrev}>
                  <span className="material-symbols-outlined">arrow_back</span>
                  {currentStep > 1 ? 'Previous Step' : 'Cancel'}
               </button>
               
               {currentStep < 3 && (
                 <button 
                   type="button" 
                   className={`btn btn--primary btn--icon-right ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                   onClick={handleNext}
                   disabled={isNextDisabled}
                   title={isNextDisabled ? 'Please allocate at least one plan for EVERY category before proceeding.' : ''}
                 >
                    Next Step
                    <span className="material-symbols-outlined">arrow_forward</span>
                 </button>
               )}
            </div>
         </div>
      </footer>
    </div>
  );
};

function getStepTitle(step: number) {
  switch(step) {
    case 1: return 'አጠቃላይ መረጃ እና ቢሮ ማደራጀት (General & Office Setup)';
    case 2: return 'ዋና ዋና ፕሮግራሞች (Activity Matrix)';
    case 3: return 'ማጠቃለያ እና ማረጋገጫ (Summary & Submit)';
    default: return 'Planning Step';
  }
}

function getStepLabel(step: number) {
  switch(step) {
    case 1: return 'Setup';
    case 2: return 'Matrix';
    case 3: return 'Submit';
    default: return '';
  }
}

export default WizardLayout;
