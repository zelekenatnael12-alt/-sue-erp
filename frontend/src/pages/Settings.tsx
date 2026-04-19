import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import MyAssets from '../components/shared/MyAssets';
import IdCardGenerator from '../components/IdCardGenerator';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    region: user?.region || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        // Patch password if needed (assuming backend supports it)
      }
      
      await api.updateAdminUser(user!.id, {
        full_name: formData.name,
        phone: formData.phone
      });
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-muted">Update your profile details and security preferences.</p>
      </div>

      <div className="settings-grid mt-6">
        {/* Profile Settings */}
        <div className="card settings-card">
          <div className="settings-card__header mb-6">
            <span className="material-symbols-outlined icon-primary">person</span>
            <h3 className="text-lg font-bold">Profile Information</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-input bg-gray-50" value={formData.email} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" name="phone" className="form-input" placeholder="+251 ..." value={formData.phone} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Region</label>
              <input type="text" name="region" className="form-input bg-gray-50" value={formData.region} disabled />
            </div>
            <div className="form-group form-group--full mt-4">
              <button type="submit" className="btn btn--primary">Save Changes</button>
            </div>
          </form>
        </div>

        {/* Digital ID Section */}
        <div className="card settings-card">
          <div className="settings-card__header mb-6">
            <span className="material-symbols-outlined icon-primary">badge</span>
            <h3 className="text-lg font-bold">Digital ID Card</h3>
          </div>
          <div className="id-preview-box">
             <p className="text-sm text-muted mb-4">
               Your official SUE Digital ID is ready for download. Use this for organizational identification and regional field activities.
             </p>
             {user && <IdCardGenerator staff={user} />}
          </div>
        </div>

        {/* Security Settings */}
        <div className="card settings-card">
          <div className="settings-card__header mb-6">
            <span className="material-symbols-outlined icon-warning">lock</span>
            <h3 className="text-lg font-bold">Change Password</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="form-grid flex-col">
            <div className="form-group form-group--full">
              <label className="form-label">Current Password</label>
              <input type="password" name="currentPassword" className="form-input" value={formData.currentPassword} onChange={handleInputChange} />
            </div>
            <div className="form-group form-group--full">
              <label className="form-label">New Password</label>
              <input type="password" name="newPassword" className="form-input" value={formData.newPassword} onChange={handleInputChange} />
            </div>
            <div className="form-group form-group--full">
              <label className="form-label">Confirm New Password</label>
              <input type="password" name="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleInputChange} />
            </div>
            <div className="form-group form-group--full mt-4">
              <button type="submit" className="btn btn--outline">Update Password</button>
            </div>
          </form>
        </div>
      </div>
      
      <div style={{ maxWidth: '600px' }}>
        <MyAssets />
      </div>
    </div>
  );
};

export default Settings;
