import { useWizard } from '../context/WizardContext';
import './Step1.css';

const Step1 = () => {
  const { data, updateData } = useWizard();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    updateData({ [name]: val });
  };

  return (
    <div className="wizard-step1">
      <section className="form-section">
        <div className="form-section__header">
          <span className="material-symbols-outlined">info</span>
          <h3>1. አጠቃላይ መረጃ [General Info]</h3>
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">የፕሮጀክት ስም (Project Name)</label>
            <input 
              name="projectName"
              value={data.projectName}
              onChange={handleInputChange}
              type="text" 
              className="form-input" 
              placeholder="Enter project name" 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">የፕሮጀክት ዓይነት (Project Type)</label>
            <select 
              name="projectType"
              value={data.projectType}
              onChange={handleInputChange}
              className="form-select"
            >
              <option>Ministry Plan</option>
              <option>Construction</option>
              <option>IT Infrastructure</option>
              <option>Community Development</option>
              <option>Other</option>
            </select>
          </div>
          
          <div className="form-group form-group--full">
            <label className="form-label">መግለጫ (Description)</label>
            <textarea 
              name="description"
              value={data.description}
              onChange={handleInputChange}
              className="form-textarea" 
              rows={4} 
              placeholder="Provide a detailed project description..."
            ></textarea>
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section__header">
          <span className="material-symbols-outlined">school</span>
          <h3>2. የትምህርት ቤቶች መረጃ [School Baseline Data]</h3>
        </div>
        
        <div className="form-grid layout-3-col">
          <div className="form-group">
            <label className="form-label">በክልላዊ ቢሮ የሚገኙ አጠቃላይ የኃይስኩል ብዛት</label>
            <span className="text-xs text-slate-500 mb-1 block">Total High Schools</span>
            <input type="number" name="totalHighSchools" value={data.totalHighSchools} onChange={handleInputChange} className="form-input" />
          </div>
          
          <div className="form-group">
            <label className="form-label">የክርስቲያን ሕብረት ያላቸው ኃይስኩሎች (SU)</label>
            <span className="text-xs text-slate-500 mb-1 block">SU Fellowship Schools</span>
            <input type="number" name="suFellowshipSchools" value={data.suFellowshipSchools} onChange={handleInputChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">ሕብረት ያላቸው ነገር ግን በኤስ.ዩ ያልተያዙ</label>
            <span className="text-xs text-slate-500 mb-1 block">Fellowship but NOT SU</span>
            <input type="number" name="fellowshipNotSuSchools" value={data.fellowshipNotSuSchools} onChange={handleInputChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">የክርስቲያን ሕብረት የሌላቸው ኃይስኩሎች ብዛት</label>
            <span className="text-xs text-slate-500 mb-1 block">No Fellowship Schools</span>
            <input type="number" name="noFellowshipSchools" value={data.noFellowshipSchools} onChange={handleInputChange} className="form-input" />
          </div>
          
          <div className="form-group">
            <label className="form-label">ሕብረት ያላቸው የመለስተኛ 2ኛ ደረጃ ት/ት ቤት</label>
            <span className="text-xs text-slate-500 mb-1 block">Middle Schools</span>
            <input type="number" name="middleSchools" value={data.middleSchools} onChange={handleInputChange} className="form-input" />
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section__header">
          <span className="material-symbols-outlined">group</span>
          <h3>3. የኤስ.ዩ አገልጋዮች መረጃ [Personnel Data]</h3>
        </div>
        
        <div className="form-grid layout-3-col">
          <div className="form-group">
            <label className="form-label">በክልሉ የሙሉ ጊዜ አገልጋዮች ብዛት</label>
            <span className="text-xs text-slate-500 mb-1 block">Full-time Staff</span>
            <input type="number" name="fullTimeStaffCount" value={data.fullTimeStaffCount} onChange={handleInputChange} className="form-input" />
          </div>
          
          <div className="form-group">
            <label className="form-label">በክልሉ የአሶሼትስ አገልጋዮች ብዛት</label>
            <span className="text-xs text-slate-500 mb-1 block">Associate Staff</span>
            <input type="number" name="associateStaffCount" value={data.associateStaffCount} onChange={handleInputChange} className="form-input" />
          </div>
          
          <div className="form-group">
            <label className="form-label">በጎ ፈቃደኞች ብዛት</label>
            <span className="text-xs text-slate-500 mb-1 block">Volunteers</span>
            <input type="number" name="volunteerCount" value={data.volunteerCount} onChange={handleInputChange} className="form-input" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Step1;
