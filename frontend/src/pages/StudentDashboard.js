import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StudentProfileForm from '../components/StudentProfileForm';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { JobCardSkeleton, StatCardSkeleton } from '../components/LoadingSkeleton';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('jobs');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchJobs();
    fetchApplications();
  }, [user, navigate]);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, skillFilter, locationFilter, jobTypeFilter, jobs]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/student');
      setProfile(response.data);
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
      const response = await api.get('/jobs');
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      showToast('Failed to fetch jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications');
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (skillFilter) {
      filtered = filtered.filter(job =>
        job.skills?.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (jobTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.jobType === jobTypeFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    if (!selectedJob) return;
    
    setApplying(true);
    try {
      await api.post(`/applications/apply/${selectedJob._id}`);
      showToast('Application submitted successfully!', 'success');
      setShowApplyModal(false);
      setSelectedJob(null);
      fetchApplications();
      fetchJobs();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to apply', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await api.delete(`/applications/${applicationId}`);
      showToast('Application withdrawn successfully', 'success');
      fetchApplications();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to withdraw', 'error');
    }
  };

  const hasApplied = (jobId) => {
    return applications.some(app => app.job?._id === jobId || app.job === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const application = applications.find(app => app.job?._id === jobId || app.job === jobId);
    return application ? application.status : null;
  };

  const getApplication = (jobId) => {
    return applications.find(app => app.job?._id === jobId || app.job === jobId);
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    const fields = ['phoneNumber', 'collegeName', 'degree', 'branch', 'graduationYear', 'skills'];
    const resumeField = profile.resume ? 1 : 0;
    const filledFields = fields.filter(field => profile[field] && profile[field].toString().trim() !== '').length;
    return Math.round(((filledFields + resumeField) / (fields.length + 1)) * 100);
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    const requiredFields = ['phoneNumber', 'collegeName', 'degree', 'branch', 'graduationYear', 'skills'];
    const hasAllFields = requiredFields.every(field => 
      profile[field] && profile[field].toString().trim() !== ''
    );
    const hasResume = profile.resume && profile.resume.filename;
    return hasAllFields && hasResume;
  };

  const handleProfileUpdate = async () => {
    const updatedProfile = await fetchProfile();
    // Hide form after successful save if profile is complete
    if (updatedProfile) {
      const requiredFields = ['phoneNumber', 'collegeName', 'degree', 'branch', 'graduationYear', 'skills'];
      const hasAllFields = requiredFields.every(field => 
        updatedProfile[field] && updatedProfile[field].toString().trim() !== ''
      );
      const hasResume = updatedProfile.resume && updatedProfile.resume.filename;
      if (hasAllFields && hasResume) {
        setShowProfileForm(false);
      }
    }
  };

  const getStats = () => {
    const applied = applications.length;
    const shortlisted = applications.filter(app => app.status === 'Shortlisted').length;
    const profileCompletion = calculateProfileCompletion();
    return {
      totalJobs: jobs.length,
      applied,
      shortlisted,
      profileCompletion
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const stats = getStats();
  const allSkills = [...new Set(jobs.flatMap(job => job.skills || []))];
  const allLocations = [...new Set(jobs.map(job => job.location).filter(Boolean))];

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

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Browse opportunities and manage your applications</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card info">
          <h3>Available Jobs</h3>
          <div className="stat-value">{stats.totalJobs}</div>
          <div className="stat-label">Total Opportunities</div>
        </div>
        <div className="stat-card">
          <h3>Applications</h3>
          <div className="stat-value">{stats.applied}</div>
          <div className="stat-label">Jobs Applied</div>
        </div>
        <div className="stat-card success">
          <h3>Shortlisted</h3>
          <div className="stat-value">{stats.shortlisted}</div>
          <div className="stat-label">Selected Candidates</div>
        </div>
        <div className="stat-card warning">
          <h3>Profile</h3>
          <div className="stat-value">{stats.profileCompletion}%</div>
          <div className="stat-label">Completion</div>
        </div>
      </div>

      {/* Profile Section */}
      {!isProfileComplete() || showProfileForm ? (
        <div className="dashboard-section">
          <StudentProfileForm 
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
                <h3 style={{ marginBottom: '10px', color: 'white' }}>✓ Profile Complete</h3>
                <p style={{ opacity: 0.9, margin: 0 }}>
                  Your profile is {calculateProfileCompletion()}% complete. You can now apply for jobs!
                </p>
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

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Browse Jobs ({jobs.length})
        </button>
        <button
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          My Applications ({applications.length})
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="dashboard-section">
          {/* Filters */}
          <div className="search-filter-bar">
            <input
              type="text"
              placeholder="Search by title or company..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            >
              <option value="">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
              {allLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Full-Time">Full-Time</option>
            </select>
          </div>

          {loading ? (
            <div>
              {[1, 2, 3].map(i => <JobCardSkeleton key={i} />)}
            </div>
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No Jobs Found"
              message={searchTerm || skillFilter || locationFilter || jobTypeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No jobs available at the moment'}
            />
          ) : (
            filteredJobs.map(job => {
              const applied = hasApplied(job._id);
              const status = getApplicationStatus(job._id);

              return (
                <div key={job._id} className="job-card">
                  <div className="job-card-header">
                    <div>
                      <h3 className="job-card-title">{job.title}</h3>
                      <div className="job-card-meta">
                        <span>🏢 {job.companyName || job.recruiter?.name || 'Company'}</span>
                        <span>📍 {job.location || 'Remote'}</span>
                        <span>💼 {job.jobType || 'Full-Time'}</span>
                        <span className="date-badge">📅 {formatDate(job.createdAt)}</span>
                      </div>
                    </div>
                    {applied && (
                      <span className={`badge badge-${status.toLowerCase()}`}>
                        {status}
                      </span>
                    )}
                  </div>

                  <p className="job-description">{job.description}</p>

                  {job.skills && job.skills.length > 0 && (
                    <div className="skills-list">
                      {job.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  )}

                  <div className="job-card-footer">
                    <div>
                      {job.experience && <span style={{ color: '#666', fontSize: '14px' }}>Experience: {job.experience}</span>}
                      {job.salary && <span style={{ color: '#666', fontSize: '14px', marginLeft: '15px' }}>💰 {job.salary}</span>}
                    </div>
                    {!applied ? (
                      <button
                        onClick={() => handleApply(job)}
                        className="btn btn-primary"
                        disabled={calculateProfileCompletion() < 70}
                        title={calculateProfileCompletion() < 70 ? 'Complete your profile first' : ''}
                      >
                        Apply Now
                      </button>
                    ) : (
                      <span style={{ color: '#666', fontSize: '14px' }}>
                        ✓ Already Applied
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="dashboard-section">
          {applications.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No Applications Yet"
              message="Start applying to jobs to see your applications here"
            />
          ) : (
            applications.map(app => (
              <div key={app._id} className={`application-card ${app.status.toLowerCase()}`}>
                <div className="job-card-header">
                  <div>
                    <h3 className="job-card-title">{app.job?.title || 'Job Title'}</h3>
                    <div className="job-card-meta">
                      <span>🏢 {app.job?.companyName || app.job?.recruiter?.name || 'Company'}</span>
                      <span>📍 {app.job?.location || 'Remote'}</span>
                      <span className="date-badge">📅 Applied: {formatDate(app.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`badge badge-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>
                {app.job?.description && (
                  <p className="job-description">{app.job.description}</p>
                )}
                {app.job?.skills && app.job.skills.length > 0 && (
                  <div className="skills-list">
                    {app.job.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}
                <div className="job-card-footer">
                  <div></div>
                  {app.status === 'Applied' && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      className="btn btn-danger"
                    >
                      Withdraw Application
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => {
          setShowApplyModal(false);
          setSelectedJob(null);
        }}
        title="Confirm Application"
        size="medium"
      >
        {selectedJob && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>{selectedJob.title}</h3>
              <p style={{ color: '#666', marginBottom: '15px' }}>{selectedJob.companyName || selectedJob.recruiter?.name}</p>
              <p>{selectedJob.description}</p>
            </div>
            
            {profile && (
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Your Profile Summary:</h4>
                <p><strong>Name:</strong> {profile.user?.name || user?.name}</p>
                <p><strong>Email:</strong> {profile.user?.email || user?.email}</p>
                {profile.collegeName && <p><strong>College:</strong> {profile.collegeName}</p>}
                {profile.degree && <p><strong>Degree:</strong> {profile.degree} - {profile.branch}</p>}
                {profile.skills && profile.skills.length > 0 && (
                  <p><strong>Skills:</strong> {profile.skills.join(', ')}</p>
                )}
                {profile.resume && (
                  <p style={{ color: '#28a745' }}>✓ Resume: {profile.resume.filename}</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowApplyModal(false);
                  setSelectedJob(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmApply}
                disabled={applying}
              >
                {applying ? 'Applying...' : 'Confirm & Apply'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDashboard;
