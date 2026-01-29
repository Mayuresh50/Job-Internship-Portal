import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ProfileSkeleton } from './LoadingSkeleton';

const RecruiterProfileForm = ({ profile, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    hrName: '',
    contactEmail: '',
    location: ''
  });
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || '',
        companyWebsite: profile.companyWebsite || '',
        companyDescription: profile.companyDescription || '',
        hrName: profile.hrName || '',
        contactEmail: profile.contactEmail || '',
        location: profile.location || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateCompletion = () => {
    const fields = ['companyName', 'companyWebsite', 'companyDescription', 'hrName', 'contactEmail', 'location'];
    const filledFields = fields.filter(field => formData[field] && formData[field].trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.put('/profiles/recruiter', formData);
      showToast('Profile updated successfully!', 'success');
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const completion = calculateCompletion();

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Company Profile</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Completion: {completion}%</span>
          <div style={{ width: '200px', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${completion}%`,
                height: '100%',
                background: completion >= 70 ? '#28a745' : '#ffc107',
                transition: 'width 0.3s'
              }}
            />
          </div>
        </div>
      </div>

      {completion < 70 && (
        <div style={{
          padding: '12px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#856404'
        }}>
          ⚠️ Please complete your company profile to post jobs.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Company Name *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter your company name"
            required
          />
        </div>

        <div className="form-group">
          <label>Company Website</label>
          <input
            type="url"
            name="companyWebsite"
            value={formData.companyWebsite}
            onChange={handleChange}
            placeholder="https://www.company.com"
          />
        </div>

        <div className="form-group">
          <label>Company Description *</label>
          <textarea
            name="companyDescription"
            value={formData.companyDescription}
            onChange={handleChange}
            placeholder="Describe your company..."
            rows="4"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>HR Name *</label>
            <input
              type="text"
              name="hrName"
              value={formData.hrName}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Email *</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="hr@company.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State or Remote"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={updating}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {updating ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default RecruiterProfileForm;
