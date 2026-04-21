import { useState, ReactNode } from 'react';
import './CardWizard.css';

export interface WizardStep {
  title: string;
  question: string;
  description?: string;
  component: ReactNode;
}

interface CardWizardProps {
  steps: WizardStep[];
  onSubmit: () => Promise<void>;
  loading?: boolean;
  error?: string;
}

const CardWizard = ({ steps, onSubmit, loading, error }: CardWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        await onSubmit();
      } catch (e) {
        // Parent handles the error state passed as prop
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="card-wizard">
      <div className="wizard-progress-bar">
        <div className="wizard-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      
      <div className="wizard-step-info">
        Step {currentStep + 1} of {steps.length}
      </div>

      <div className="wizard-card-container">
        {error && (
          <div className="wizard-error-banner">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}
        
        <div className="wizard-card" key={currentStep}>
          <h2 className="wizard-title">{steps[currentStep].title}</h2>
          <p className="wizard-question">{steps[currentStep].question}</p>
          {steps[currentStep].description && (
            <p className="wizard-description">{steps[currentStep].description}</p>
          )}
          <div className="wizard-input-area">
            {steps[currentStep].component}
          </div>
        </div>
      </div>

      <div className="wizard-controls">
        {currentStep > 0 && (
          <button className="wizard-btn wizard-btn--prev" onClick={handlePrev} disabled={loading}>
            Previous
          </button>
        )}
        <button 
          className="wizard-btn wizard-btn--next" 
          onClick={handleNext} 
          disabled={loading}
          style={{ width: currentStep === 0 ? '100%' : 'auto', flex: 1 }}
        >
          {loading ? (
            <div className="btn-loading-state">
              <span className="wizard-spinner"></span>
              Submitting...
            </div>
          ) : (
            currentStep === steps.length - 1 ? 'Complete & Submit' : 'Next Step'
          )}
        </button>
      </div>
    </div>
  );
};

export default CardWizard;
