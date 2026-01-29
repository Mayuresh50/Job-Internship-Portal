import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to={user ? (user.role === 'student' ? '/student' : '/recruiter') : '/'} style={{ textDecoration: 'none', color: 'white' }}>
          <h1>Job & Internship Portal</h1>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <span style={{ fontSize: '14px' }}>Welcome, <strong>{user.name}</strong></span>
              {user.role === 'student' ? (
                <>
                  <Link to="/student">Dashboard</Link>
                  <Link to="/student">Browse Jobs</Link>
                </>
              ) : (
                <>
                  <Link to="/recruiter">Dashboard</Link>
                  <Link to="/recruiter">My Jobs</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn" style={{ fontSize: '14px', padding: '8px 16px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;