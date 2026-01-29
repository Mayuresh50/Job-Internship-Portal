import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RecruiterProfileForm from '../components/RecruiterProfileForm';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { JobCardSkeleton, StatCardSkeleton } from '../components/LoadingSkeleton';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [jobs, setJobs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobData, setSelectedJobData] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    skills: '',
    jobType: 'Full-Time',
    location: 'Remote',
    experience: '0-1 years',
    salary: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  const [submitting, setSubmitting] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'recruiter') {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchJobs();
    fetchAllApplications();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/recruiter');
      setProfile(response.data);
      // Check if profile is complete and hide form if it is
      const requiredFields = ['companyName', 'companyDescription', 'hrName', 'contactEmail', 'location'];
      const hasAllFields = requiredFields.every(field => 
        response.data[field] && response.data[field].toString().trim() !== ''
      );
      if (hasAllFields) {
        setShowProfileForm(false);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile');
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/recruiter/my-jobs');
      setJobs(response.data);
    } catch (error) {
      showToast('Failed to fetch jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApplications = async () => {
    try {
      const response = await api.get('/applications');
      setAllApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications');
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      setApplicants(response.data);
      setSelectedJob(jobId);
      const job = jobs.find(j => j._id === jobId);
      setSelectedJobData(job);
    } catch (error) {
      showToast('Failed to fetch applicants', 'error');
    }
  };

  const handleJobFormChange = (e) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const skillsArray = jobForm.skills.split(',').map(s => s.trim()).filter(s => s);
      const payload = {
        ...jobForm,
        skills: skillsArray,
        companyName: jobForm.companyName || profile?.companyName || ''
      };

      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, payload);
        showToast('Job updated successfully!', 'success');
        setShowEditModal(false);
      } else {
        await api.post('/jobs', payload);
        showToast('Job posted successfully!', 'success');
        setShowJobForm(false);
      }

      setJobForm({
        title: '',
        description: '',
        skills: '',
        jobType: 'Full-Time',
        location: 'Remote',
        experience: '0-1 years',
        salary: '',
        companyName: ''
      });
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      skills: job.skills.join(', '),
      jobType: job.jobType || 'Full-Time',
      location: job.location || 'Remote',
      experience: job.experience || '0-1 years',
      salary: job.salary || '',
      companyName: job.companyName || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      showToast('Job deleted successfully', 'success');
      fetchJobs();
      if (selectedJob === jobId) {
        setSelectedJob(null);
        setApplicants([]);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete job', 'error');
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await api.put(`/applications/${applicationId}`, { status: newStatus });
      showToast('Status updated successfully!', 'success');
      fetchApplicants(selectedJob);
      fetchAllApplications();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const getJobStats = (jobId) => {
    const jobApplications = allApplications.filter(app => 
      app.job?._id === jobId || app.job === jobId
    );
    return {
      total: jobApplications.length,
      applied: jobApplications.filter(app => app.status === 'Applied').length,
      shortlisted: jobApplications.filter(app => app.status === 'Shortlisted').length,
      rejected: jobApplications.filter(app => app.status === 'Rejected').length
    };
  };

  const getOverallStats = () => {
    const totalJobs = jobs.length;
    const totalApplications = allApplications.length;
    const totalApplicants = new Set(allApplications.map(app => app.student?._id || app.student)).size;
    const shortlisted = allApplications.filter(app => app.status === 'Shortlisted').length;
    
    return { totalJobs, totalApplications, totalApplicants, shortlisted };
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    const fields = ['companyName', 'companyDescription', 'hrName', 'contactEmail', 'location'];
    const filledFields = fields.filter(field => profile[field] && profile[field].toString().trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    const requiredFields = ['companyName', 'companyDescription', 'hrName', 'contactEmail', 'location'];
    return requiredFields.every(field => 
      profile[field] && profile[field].toString().trim() !== ''
    );
  };

  const handleProfileUpdate = async () => {
    const updatedProfile = await fetchProfile();
    // Hide form after successful save if profile is complete
    if (updatedProfile) {
      const requiredFields = ['companyName', 'companyDescription', 'hrName', 'contactEmail', 'location'];
      const hasAllFields = requiredFields.every(field => 
        updatedProfile[field] && updatedProfile[field].toString().trim() !== ''
      );
      if (hasAllFields) {
        setShowProfileForm(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || profileLoading) {
    return (
      <div className="container">
        <div style={{ display: 'grid', gap: '20px' }}>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  const overallStats = getOverallStats();
  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1>Recruiter Dashboard</h1>
            <p>Manage job postings and review applications</p>
          </div>
          <button
            onClick={() => {
              if (profileCompletion < 70) {
                showToast('Please complete your profile first (70% required)', 'warning');
                return;
              }
              setShowJobForm(!showJobForm);
            }}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            {showJobForm ? '✕ Cancel' : '+ Post New Job'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card info">
          <h3>Active Jobs</h3>
          <div className="stat-value">{overallStats.totalJobs}</div>
          <div className="stat-label">Job Postings</div>
        </div>
        <div className="stat-card">
          <h3>Total Applications</h3>
          <div className="stat-value">{overallStats.totalApplications}</div>
          <div className="stat-label">All Applications</div>
        </div>
        <div className="stat-card success">
          <h3>Unique Candidates</h3>
          <div className="stat-value">{overallStats.totalApplicants}</div>
          <div className="stat-label">Total Applicants</div>
        </div>
        <div className="stat-card warning">
          <h3>Shortlisted</h3>
          <div className="stat-value">{overallStats.shortlisted}</div>
          <div className="stat-label">Selected Candidates</div>
        </div>
      </div>

      {/* Profile Section */}
      {!isProfileComplete() || showProfileForm ? (
        <div className="dashboard-section">
          <RecruiterProfileForm 
            profile={profile} 
            onUpdate={handleProfileUpdate} 
            loading={profileLoading} 
          />
        </div>
      ) : (
        <div className="dashboard-section">
          <div className="card" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '10px', color: 'white' }}>✓ Company Profile Complete</h3>
                <p style={{ opacity: 0.9, margin: 0 }}>
                  Your company profile is {calculateProfileCompletion()}% complete. You can now post jobs!
                </p>
                {profile?.companyName && (
                  <p style={{ opacity: 0.9, marginTop: '8px', fontSize: '14px' }}>
                    <strong>Company:</strong> {profile.companyName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowProfileForm(true)}
                className="btn"
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: '1px solid white',
                  padding: '10px 20px'
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Posting Form */}
      {showJobForm && (
        <div className="card" style={{ marginBottom: '30px', border: '2px solid #007bff' }}>
          <h3 style={{ marginBottom: '20px', color: '#007bff' }}>📝 Post a New Job</h3>
          <form onSubmit={handleJobSubmit}>
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={jobForm.title}
                onChange={handleJobFormChange}
                placeholder="e.g., Full Stack Developer"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Job Type *</label>
                <select name="jobType" value={jobForm.jobType} onChange={handleJobFormChange} required>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={jobForm.location}
                  onChange={handleJobFormChange}
                  placeholder="e.g., Remote, New York, etc."
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Experience Required</label>
                <input
                  type="text"
                  name="experience"
                  value={jobForm.experience}
                  onChange={handleJobFormChange}
                  placeholder="e.g., 0-1 years, 2-3 years"
                />
              </div>
              <div className="form-group">
                <label>Salary / Stipend</label>
                <input
                  type="text"
                  name="salary"
                  value={jobForm.salary}
                  onChange={handleJobFormChange}
                  placeholder="e.g., $50k-70k, $500/month"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={jobForm.companyName || profile?.companyName || ''}
                onChange={handleJobFormChange}
                placeholder={profile?.companyName || 'Enter company name'}
              />
            </div>
            <div className="form-group">
              <label>Job Description *</label>
              <textarea
                name="description"
                value={jobForm.description}
                onChange={handleJobFormChange}
                placeholder="Describe the role, responsibilities, and requirements..."
                required
                rows="6"
              />
            </div>
            <div className="form-group">
              <label>Required Skills (comma-separated) *</label>
              <input
                type="text"
                name="skills"
                value={jobForm.skills}
                onChange={handleJobFormChange}
                placeholder="e.g., React, Node.js, MongoDB, Express"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '12px' }}
            >
              {submitting ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          My Jobs ({jobs.length})
        </button>
        <button
          className={`tab ${activeTab === 'applicants' ? 'active' : ''}`}
          onClick={() => setActiveTab('applicants')}
        >
          Applicants {selectedJob && `(${applicants.length})`}
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="dashboard-section">
          <div className="search-filter-bar">
            <input
              type="text"
              placeholder="Search your jobs..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredJobs.length === 0 ? (
            <EmptyState
              icon="💼"
              title="No Jobs Posted Yet"
              message="Click 'Post New Job' to create your first job posting"
            />
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {filteredJobs.map(job => {
                const stats = getJobStats(job._id);
                return (
                  <div key={job._id} className="job-card">
                    <div className="job-card-header">
                      <div>
                        <h3 className="job-card-title">{job.title}</h3>
                        <div className="job-card-meta">
                          <span>💼 {job.jobType || 'Full-Time'}</span>
                          <span>📍 {job.location || 'Remote'}</span>
                          <span className="date-badge">📅 {formatDate(job.createdAt)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#007bff', fontWeight: '600' }}>
                          {stats.total} {stats.total === 1 ? 'Application' : 'Applications'}
                        </span>
                      </div>
                    </div>

                    <p className="job-description">{job.description}</p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="skills-list">
                        {job.skills.map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffc107' }}>{stats.applied}</div>
                          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Applied</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#28a745' }}>{stats.shortlisted}</div>
                          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Shortlisted</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc3545' }}>{stats.rejected}</div>
                          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Rejected</div>
                        </div>
                      </div>
                    </div>

                    <div className="job-card-footer">
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleEdit(job)}
                          className="btn btn-secondary"
                          style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="btn btn-danger"
                          style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          fetchApplicants(job._id);
                          setActiveTab('applicants');
                        }}
                        className="btn btn-primary"
                      >
                        View Applicants ({stats.total})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Applicants Tab */}
      {activeTab === 'applicants' && (
        <div className="dashboard-section">
          {!selectedJob ? (
            <EmptyState
              icon="👥"
              title="Select a Job"
              message="Choose a job from 'My Jobs' tab to view applicants"
            />
          ) : (
            <>
              {selectedJobData && (
                <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <h3 style={{ marginBottom: '10px' }}>{selectedJobData.title}</h3>
                  <p style={{ opacity: 0.9 }}>{selectedJobData.description}</p>
                </div>
              )}

              {applicants.length === 0 ? (
                <EmptyState
                  icon="📭"
                  title="No Applicants Yet"
                  message="This job hasn't received any applications yet"
                />
              ) : (
                <div>
                  <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <strong>Total Applicants: {applicants.length}</strong>
                  </div>
                  {applicants.map(app => (
                    <div key={app._id} className={`application-card ${app.status.toLowerCase()}`}>
                      <div className="applicant-header">
                        <div className="applicant-info">
                          <h4>{app.student?.name || 'Applicant'}</h4>
                          <p>📧 {app.student?.email || 'No email'}</p>
                          {app.studentProfile && (
                            <>
                              {app.studentProfile.collegeName && (
                                <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                                  🎓 {app.studentProfile.collegeName} - {app.studentProfile.degree} {app.studentProfile.branch}
                                </p>
                              )}
                              {app.studentProfile.skills && app.studentProfile.skills.length > 0 && (
                                <div className="skills-list" style={{ marginTop: '10px' }}>
                                  {app.studentProfile.skills.map((skill, idx) => (
                                    <span key={idx} className="skill-tag">{skill}</span>
                                  ))}
                                </div>
                              )}
                              {app.studentProfile.resume && (
                                <p style={{ marginTop: '10px', fontSize: '14px', color: '#007bff' }}>
                                  📄 Resume: {app.studentProfile.resume.filename}
                                </p>
                              )}
                            </>
                          )}
                          <p className="date-badge" style={{ marginTop: '5px' }}>
                            Applied: {formatDate(app.createdAt)}
                          </p>
                        </div>
                        <div className="applicant-actions">
                          <span className={`badge badge-${app.status.toLowerCase()}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          Update Application Status:
                        </label>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                          className="status-select"
                          style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Edit Job Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingJob(null);
          setJobForm({
            title: '',
            description: '',
            skills: '',
            jobType: 'Full-Time',
            location: 'Remote',
            experience: '0-1 years',
            salary: '',
            companyName: ''
          });
        }}
        title="Edit Job"
        size="large"
      >
        <form onSubmit={handleJobSubmit}>
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="title"
              value={jobForm.title}
              onChange={handleJobFormChange}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Job Type *</label>
              <select name="jobType" value={jobForm.jobType} onChange={handleJobFormChange} required>
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={jobForm.location}
                onChange={handleJobFormChange}
                required
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Experience Required</label>
              <input
                type="text"
                name="experience"
                value={jobForm.experience}
                onChange={handleJobFormChange}
              />
            </div>
            <div className="form-group">
              <label>Salary / Stipend</label>
              <input
                type="text"
                name="salary"
                value={jobForm.salary}
                onChange={handleJobFormChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              value={jobForm.description}
              onChange={handleJobFormChange}
              required
              rows="6"
            />
          </div>
          <div className="form-group">
            <label>Required Skills (comma-separated) *</label>
            <input
              type="text"
              name="skills"
              value={jobForm.skills}
              onChange={handleJobFormChange}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowEditModal(false);
                setEditingJob(null);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecruiterDashboard;
