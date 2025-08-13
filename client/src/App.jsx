import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';
import ProblemListPage from './components/ProblemListPage';

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkUserRole = async () => {
      if (token) {
        try {
          // Create an axios instance with the auth token
          const api = axios.create({
            headers: { 'x-auth-token': token },
          });
          // Fetch the user's data from the new backend route
          const res = await api.get('http://localhost:5000/api/users/me');
          setUserRole(res.data.role); // Set the user's role in state
        } catch (err) {
          console.error('Could not fetch user role', err);
          // If token is invalid, remove it
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkUserRole();
  }, [token]); // This effect runs whenever the token changes

  // Show a loading message while we check the user's role
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // --- The Routing Logic ---
  if (token) {
    if (userRole === 'admin') {
      return <AdminDashboard />;
    } else {
      return <ProblemListPage />;
    }
  } else {
    return <AuthPage />;
  }
};

export default App;