import React, { useState } from 'react';
import axios from 'axios';

// --- Sign In Form ---
const SignInForm = ({ toggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      window.location.reload();
    } catch (error) {
      alert('Login failed: ' + (error.response ? error.response.data.msg : 'Server error'));
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
          <input className="shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
          <input className="shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full">Sign In</button>
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <button type="button" onClick={toggleMode} className="font-bold text-blue-500 hover:text-blue-800">Sign Up</button>
        </p>
      </form>
    </div>
  );
};

// --- Sign Up Form ---
const SignUpForm = ({ toggleMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      alert('Registration successful! Please sign in.');
      window.location.reload();
    } catch (error) {
      alert('Registration failed: ' + (error.response ? error.response.data.msg : 'Server error'));
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
          <input className="shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">Email</label>
          <input className="shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">Password</label>
          <input className="shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full">Sign Up</button>
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <button type="button" onClick={toggleMode} className="font-bold text-blue-500 hover:text-blue-800">Sign In</button>
        </p>
      </form>
    </div>
  );
};


// --- Authentication Page Component ---
const AuthPage = () => {
    const [authMode, setAuthMode] = useState('signIn');
    const toggleAuthMode = () => {
        setAuthMode(currentMode => (currentMode === 'signIn' ? 'signUp' : 'signIn'));
    };
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                {authMode === 'signIn' ? <SignInForm toggleMode={toggleAuthMode} /> : <SignUpForm toggleMode={toggleAuthMode} />}
            </div>
        </div>
    );
};

export default AuthPage;