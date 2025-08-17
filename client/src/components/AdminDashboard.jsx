import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link

// --- Manage Test Cases Modal Component ---
const ManageTestCasesModal = ({ problemId, onClose }) => {
  const [testCases, setTestCases] = useState([]);
  const [formData, setFormData] = useState({
    input: '',
    expectedOutput: '',
    isSample: false,
  });

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'x-auth-token': localStorage.getItem('token') },
  });

  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        const res = await api.get(`/testcases/${problemId}`);
        setTestCases(res.data);
      } catch (err) {
        console.error('Failed to fetch test cases', err);
      }
    };
    if (problemId) {
        fetchTestCases();
    }
  }, [problemId]);

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/testcases', { ...formData, problemId });
      setTestCases([...testCases, res.data]);
      setFormData({ input: '', expectedOutput: '', isSample: false });
      alert('Test case added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add test case.');
    }
  };

  const handleDelete = async (testCaseId) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      try {
        await api.delete(`/testcases/${testCaseId}`);
        setTestCases(testCases.filter((tc) => tc._id !== testCaseId));
        alert('Test case deleted.');
      } catch (err) {
        console.error(err);
        alert('Failed to delete test case.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Test Cases</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        <form onSubmit={onSubmit} className="mb-4 border-b pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Input</label>
              <textarea name="input" value={formData.input} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="3"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Output</label>
              <textarea name="expectedOutput" value={formData.expectedOutput} onChange={onChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="3"></textarea>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="isSample" name="isSample" type="checkbox" checked={formData.isSample} onChange={onChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isSample" className="font-medium text-gray-700">Is this a sample test case?</label>
                <p className="text-gray-500">Sample cases are visible to users.</p>
              </div>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Add Test Case</button>
          </div>
        </form>
        <div className="flex-grow overflow-y-auto">
          <h3 className="text-xl font-bold mb-2">Existing Test Cases</h3>
          {testCases.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {testCases.map((tc) => (
                <li key={tc._id} className="py-3 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Input: <pre className="bg-gray-100 p-1 rounded inline-block">{tc.input}</pre></div>
                    <div className="text-sm text-gray-500 mt-1">Output: <pre className="bg-gray-100 p-1 rounded inline-block">{tc.expectedOutput}</pre></div>
                    <p className={`text-xs mt-2 font-semibold ${tc.isSample ? 'text-green-600' : 'text-red-600'}`}>{tc.isSample ? 'SAMPLE' : 'HIDDEN'}</p>
                  </div>
                  <button onClick={() => handleDelete(tc._id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No test cases found for this problem.</p>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Admin Dashboard Component ---
const AdminDashboard = () => {
  const [problems, setProblems] = useState([]);
  // --- MODIFIED: Added solutionCode to initial state ---
  const [formData, setFormData] = useState({ 
    name: '', 
    statement: '', 
    difficulty: 'Easy',
    solutionCode: {
        cpp: '',
        py: '',
        java: ''
    }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
          handleLogout();
        }
      }
    };
    fetchProblems();
  }, []);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- NEW: Handler for nested solutionCode state ---
  const handleSolutionCodeChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        solutionCode: {
            ...prev.solutionCode,
            [name]: value
        }
    }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/problems', formData);
      setProblems([res.data, ...problems]);
      alert(`Problem created successfully!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to create problem. Check the console for details.`);
    }
    // --- MODIFIED: Reset all fields including solutionCode ---
    setFormData({ 
        name: '', 
        statement: '', 
        difficulty: 'Easy',
        solutionCode: { cpp: '', py: '', java: '' }
    });
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

  const openTestCasesModal = (problemId) => {
    setSelectedProblemId(problemId);
    setIsModalOpen(true);
  };

  const closeTestCasesModal = () => {
    setIsModalOpen(false);
    setSelectedProblemId(null);
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Create New Problem</h2>
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

                {/* --- NEW: Solution Code Textareas --- */}
                <div className="mb-4 p-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">Solution Code</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold">C++ Solution</label>
                            <textarea name="cpp" value={formData.solutionCode.cpp} onChange={handleSolutionCodeChange} className="w-full p-2 border rounded mt-1 font-mono bg-gray-50" rows="6"></textarea>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold">Python Solution</label>
                            <textarea name="py" value={formData.solutionCode.py} onChange={handleSolutionCodeChange} className="w-full p-2 border rounded mt-1 font-mono bg-gray-50" rows="6"></textarea>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold">Java Solution</label>
                            <textarea name="java" value={formData.solutionCode.java} onChange={handleSolutionCodeChange} className="w-full p-2 border rounded mt-1 font-mono bg-gray-50" rows="6"></textarea>
                        </div>
                    </div>
                </div>

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Create Problem
                </button>
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
                  <Link to={`/problems/${problem._id}/edit`} className="bg-yellow-400 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-500 transition-colors text-sm">
                    Edit
                  </Link>
                  <button onClick={() => openTestCasesModal(problem._id)} className="bg-indigo-500 text-white px-3 py-1 rounded mr-2 hover:bg-indigo-600 transition-colors text-sm">Test Cases</button>
                  <button onClick={() => handleDelete(problem._id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && <ManageTestCasesModal problemId={selectedProblemId} onClose={closeTestCasesModal} />}
    </>
  );
};

export default AdminDashboard;