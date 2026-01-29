import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/auth/signup', formData);
      // After signup, automatically login
      const loginResponse = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      login(loginResponse.data.token, loginResponse.data.user);
      navigate(loginResponse.data.user.role === 'student' ? '/student' : '/recruiter');
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '50px auto' }}>
        <div className="card">
          <h2>Sign Up</h2>
          {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Sign Up
            </button>
          </form>
          <p style={{ marginTop: '15px', textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
