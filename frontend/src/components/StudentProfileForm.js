import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ProfileSkeleton } from './LoadingSkeleton';

const StudentProfileForm = ({ profile, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    collegeName: '',
    degree: '',
    branch: '',
    graduationYear: '',
    skills: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        phoneNumber: profile.phoneNumber || '',
        collegeName: profile.collegeName || '',
        degree: profile.degree || '',
        branch: profile.branch || '',
        graduationYear: profile.graduationYear || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || '')
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Please upload a PDF file only', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('File size must be less than 2MB', 'error');
        return;
      }
      setResumeFile(file);
      showToast('Resume selected. Click Save to upload.', 'info');
    }
  };

  const calculateCompletion = () => {
    const fields = ['phoneNumber', 'collegeName', 'degree', 'branch', 'graduationYear', 'skills'];
    const resumeField = profile?.resume ? 1 : 0;
    const filledFields = fields.filter(field => formData[field] && formData[field].trim() !== '').length;
    return Math.round(((filledFields + resumeField) / (fields.length + 1)) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload resume if selected
      if (resumeFile) {
        await api.post('/profiles/student/resume', {
          filename: resumeFile.name,
          mimetype: resumeFile.type
        });
      }

      // Update profile
      await api.put('/profiles/student', {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      });

      showToast('Profile updated successfully!', 'success');
      setResumeFile(null);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setUploading(false);
    }
  };

  const completion = calculateCompletion();

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Complete Your Profile</h3>
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
          ⚠️ Please complete at least 70% of your profile to improve your job application success rate.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profile?.user?.name || ''}
            disabled
            style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={profile?.user?.email || ''}
            disabled
            style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="form-group">
          <label>College Name *</label>
          <input
            type="text"
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            placeholder="Enter your college/university name"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Degree *</label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              placeholder="e.g., B.Tech, B.E., M.Tech"
            />
          </div>

          <div className="form-group">
            <label>Branch *</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="e.g., Computer Science, Electronics"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Graduation Year *</label>
          <input
            type="text"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            placeholder="e.g., 2024, 2025"
          />
        </div>

        <div className="form-group">
          <label>Skills (comma-separated) *</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g., React, Node.js, MongoDB, Python"
          />
        </div>

        <div className="form-group">
          <label>Resume (PDF, max 2MB)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ padding: '8px' }}
          />
          {profile?.resume && (
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#28a745' }}>
              ✓ Current resume: {profile.resume.filename}
            </p>
          )}
          {resumeFile && (
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#007bff' }}>
              Selected: {resumeFile.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={uploading}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {uploading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default StudentProfileForm;
