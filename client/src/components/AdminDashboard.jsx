import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [formData, setFormData] = useState({ name: '', statement: '', difficulty: 'Easy' });
  const [editingProblem, setEditingProblem] = useState(null);

  // --- NEW: Logout Function ---
  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    // Reload the page to go back to the AuthPage
    window.location.reload();
  };

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'x-auth-token': localStorage.getItem('token') },
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/problems');
        setProblems(res.data);
      } catch (err) {
        console.error('Failed to fetch problems:', err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert('Your session has expired. Please log in again.');
          handleLogout(); // Use the logout function
        }
      }
    };
    fetchProblems();
  }, []);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    const action = editingProblem ? 'update' : 'create';
    try {
      let res;
      if (editingProblem) {
        res = await api.put(`/problems/${editingProblem._id}`, formData);
        setProblems(problems.map(p => (p._id === editingProblem._id ? res.data : p)));
      } else {
        res = await api.post('/problems', formData);
        setProblems([res.data, ...problems]);
      }
      alert(`Problem ${action}d successfully!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} problem. Check the console for details.`);
    }
    setFormData({ name: '', statement: '', difficulty: 'Easy' });
    setEditingProblem(null);
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setFormData({ name: problem.name, statement: problem.statement, difficulty: problem.difficulty });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await api.delete(`/problems/${id}`);
        setProblems(problems.filter(p => p._id !== id));
        alert('Problem deleted successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to delete problem.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* --- NEW: Header with Logout Button --- */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">{editingProblem ? 'Edit Problem' : 'Create New Problem'}</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Problem Name</label>
            <input type="text" name="name" value={formData.name} onChange={onChange} className="w-full p-2 border rounded mt-1" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Problem Statement</label>
            <textarea name="statement" value={formData.statement} onChange={onChange} className="w-full p-2 border rounded mt-1" rows="4" required></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Difficulty</label>
            <select name="difficulty" value={formData.difficulty} onChange={onChange} className="w-full p-2 border rounded mt-1">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            {editingProblem ? 'Update Problem' : 'Create Problem'}
          </button>
          {editingProblem && (
            <button type="button" onClick={() => { setEditingProblem(null); setFormData({ name: '', statement: '', difficulty: 'Easy' }); }} className="bg-gray-500 text-white px-4 py-2 rounded ml-2 hover:bg-gray-600 transition-colors">
              Cancel Edit
            </button>
          )}
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Existing Problems</h2>
        <div className="space-y-4">
          {problems.map(problem => (
            <div key={problem._id} className="border-b pb-4 flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <h3 className="text-xl font-semibold">{problem.name} <span className={`text-xs font-medium align-middle ml-2 px-2.5 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{problem.difficulty}</span></h3>
                <p className="text-gray-600 mt-2">{problem.statement}</p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                <button onClick={() => handleEdit(problem)} className="bg-yellow-400 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-500 transition-colors text-sm">Edit</button>
                <button onClick={() => handleDelete(problem._id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
