import { createContext, useContext, useState, ReactNode } from 'react';
import { OFFICIAL_TEMPLATE_CATEGORIES } from '../utils/templateData';

export interface PlanMatrixActivity {
  category: string;
  activityName: string;
  targetMeskerem: number;
  targetTikimt: number;
  targetHidar: number;
  targetTahsas: number;
  targetTir: number;
  targetYekatit: number;
  targetMegabit: number;
  targetMiyazia: number;
  targetGinbot: number;
  targetSene: number;
  targetHamle: number;
  targetNehase: number;
  budgetRequired: number;
}

export interface WizardData {
  projectName: string;
  projectType: string;
  description: string;
  orgStructure: string;
  leadRoles: string;
  
  // Baseline - Schools
  totalHighSchools: number;
  suFellowshipSchools: number;
  fellowshipNotSuSchools: number;  // fellowship but NOT SU
  noFellowshipSchools: number;
  middleSchools: number;
  
  // Baseline - Personnel
  fullTimeStaffCount: number;
  associateStaffCount: number;
  volunteerCount: number;

  matrixActivities: PlanMatrixActivity[];
}

const generateInitialMatrix = (): PlanMatrixActivity[] => {
  const activities: PlanMatrixActivity[] = [];
  OFFICIAL_TEMPLATE_CATEGORIES.forEach(category => {
    category.activities.forEach(act => {
      activities.push({
        category: category.id,
        activityName: act.name,
        targetMeskerem: 0,
        targetTikimt: 0,
        targetHidar: 0,
        targetTahsas: 0,
        targetTir: 0,
        targetYekatit: 0,
        targetMegabit: 0,
        targetMiyazia: 0,
        targetGinbot: 0,
        targetSene: 0,
        targetHamle: 0,
        targetNehase: 0,
        budgetRequired: 0
      });
    });
  });
  return activities;
};

const initialData: WizardData = {
  projectName: '',
  projectType: 'Ministry Plan',
  description: '',
  orgStructure: '',
  leadRoles: '',
  
  totalHighSchools: 0,
  suFellowshipSchools: 0,
  fellowshipNotSuSchools: 0,
  noFellowshipSchools: 0,
  middleSchools: 0,
  
  fullTimeStaffCount: 0,
  associateStaffCount: 0,
  volunteerCount: 0,

  matrixActivities: generateInitialMatrix()
};

interface WizardContextType {
  data: WizardData;
  updateData: (newData: Partial<WizardData>) => void;
  updateMatrixActivity: (index: number, changes: Partial<PlanMatrixActivity>) => void;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<WizardData>(initialData);

  const updateData = (newData: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const updateMatrixActivity = (index: number, changes: Partial<PlanMatrixActivity>) => {
    setData(prev => {
      const newActivities = [...prev.matrixActivities];
      newActivities[index] = { ...newActivities[index], ...changes };
      return { ...prev, matrixActivities: newActivities };
    });
  };

  const resetWizard = () => setData(initialData);

  return (
    <WizardContext.Provider value={{ data, updateData, updateMatrixActivity, resetWizard }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
