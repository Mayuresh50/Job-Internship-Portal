import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'student' ? '/student' : '/recruiter'} />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to={user.role === 'student' ? '/student' : '/recruiter'} />} />
        <Route 
          path="/student" 
          element={user && user.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/recruiter" 
          element={user && user.role === 'recruiter' ? <RecruiterDashboard /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={user ? (user.role === 'student' ? '/student' : '/recruiter') : '/login'} />} />
      </Routes>
    </div>
  );
}

export default App;