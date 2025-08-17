import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';
import ProblemListPage from './components/ProblemListPage';
import ProblemPage from './components/ProblemPage';
import EditProblemPage from './components/EditProblemPage';

// This is the "receptionist" component that handles redirection after login.
const HomeRedirect = ({ userRole }) => {
    if (userRole === 'admin') {
        return <Navigate to="/admin" />;
    } else {
        return <Navigate to="/problems" />;
    }
};

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkUserRole = async () => {
      if (token) {
        try {
          const api = axios.create({ headers: { 'x-auth-token': token } });
          const res = await api.get('http://localhost:5000/api/users/me');
          setUserRole(res.data.role);
        } catch (err) {
          console.error('Could not fetch user role', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUserRole();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* This route now uses our smart receptionist */}
        <Route path="/" element={!token ? <AuthPage /> : <HomeRedirect userRole={userRole} />} />
        <Route path="/admin" element={token && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/problems" element={token ? <ProblemListPage /> : <Navigate to="/" />} />
        <Route path="/problem/:id" element={token ? <ProblemPage /> : <Navigate to="/" />} />
        <Route path="/problems/:id/edit" element={token && userRole === 'admin' ? <EditProblemPage /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;