import { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { OFFICIAL_TEMPLATE_CATEGORIES, ETHIOPIAN_MONTHS } from '../utils/templateData';
import './Step3.css';

const Step3 = () => {
  const { data, updateMatrixActivity } = useWizard();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Get the index of the first activity in a category within the flat matrix array
  const getCategoryStartIndex = (categoryId: string) => {
    let idx = 0;
    for (const cat of OFFICIAL_TEMPLATE_CATEGORIES) {
      if (cat.id === categoryId) return idx;
      idx += cat.activities.length;
    }
    return 0;
  };

  const handleCellChange = (activityIndex: number, monthId: string, value: string) => {
    updateMatrixActivity(activityIndex, { [monthId]: parseInt(value) || 0 });
  };

  const handleBudgetChange = (activityIndex: number, value: string) => {
    updateMatrixActivity(activityIndex, { budgetRequired: parseFloat(value) || 0 });
  };

  return (
    <div className="wizard-step3">
      <div className="matrix-intro">
        <p>Fill in the planned number of activities per month for each category below. Click on a category title to expand and edit its details. You must allocate at least one plan for each category.</p>
      </div>

      <div className="matrix-categories-list">
        {OFFICIAL_TEMPLATE_CATEGORIES.map(category => {
          const categoryStartIndex = getCategoryStartIndex(category.id);
          const isExpanded = expandedCategories.has(category.id);

          // Calculate total for a given month across all activities in this category
          const getMonthTotal = (monthId: string) => {
            return category.activities.reduce((sum, _, i) => {
              const idx = categoryStartIndex + i;
              return sum + ((data.matrixActivities[idx]?.[monthId as keyof typeof data.matrixActivities[0]] as number) || 0);
            }, 0);
          };

          const getCategoryBudgetTotal = () => {
            return category.activities.reduce((sum, _, i) => {
              const idx = categoryStartIndex + i;
              return sum + (data.matrixActivities[idx]?.budgetRequired || 0);
            }, 0);
          };

          return (
            <section key={category.id} className={`form-section matrix-section ${isExpanded ? 'matrix-section--expanded' : ''}`}>
              <div 
                className="form-section__header matrix-accordion-header" 
                onClick={() => toggleCategory(category.id)}
              >
                <div className="matrix-accordion-header-left">
                  <span className="material-symbols-outlined">table_chart</span>
                  <h3>{category.name}</h3>
                </div>
                <div className="matrix-accordion-header-right">
                  <span className={`material-symbols-outlined transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="matrix-table-wrapper">
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th className="matrix-th-activity">ተግባር (Activity)</th>
                        {ETHIOPIAN_MONTHS.map(month => (
                          <th key={month.id} className="matrix-th-month" title={month.name}>
                            {month.short}
                          </th>
                        ))}
                        <th className="matrix-th-budget">በጀት (Budget)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.activities.map((activity, i) => {
                        const activityIndex = categoryStartIndex + i;
                        const activityData = data.matrixActivities[activityIndex];

                        return (
                          <tr key={activity.id} className="matrix-row">
                            <td className="matrix-td-activity">
                              <span>{i + 1}. {activity.name}</span>
                            </td>
                            {ETHIOPIAN_MONTHS.map(month => (
                              <td key={month.id} className="matrix-td-cell">
                                <input
                                  type="number"
                                  min="0"
                                  className="matrix-cell-input"
                                  value={activityData?.[month.id as keyof typeof activityData] || 0}
                                  onChange={e => handleCellChange(activityIndex, month.id, e.target.value)}
                                />
                              </td>
                            ))}
                            <td className="matrix-td-budget">
                              <input
                                type="number"
                                min="0"
                                step="100"
                                className="matrix-cell-input matrix-cell-input--budget"
                                value={activityData?.budgetRequired || 0}
                                onChange={e => handleBudgetChange(activityIndex, e.target.value)}
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="matrix-total-row">
                        <td className="matrix-td-activity"><strong>ድምር (Total)</strong></td>
                        {ETHIOPIAN_MONTHS.map(month => (
                          <td key={month.id} className="matrix-td-cell">
                            <strong>{getMonthTotal(month.id) || ''}</strong>
                          </td>
                        ))}
                        <td className="matrix-td-budget">
                          <strong>{getCategoryBudgetTotal().toLocaleString()} ETB</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Step3;
