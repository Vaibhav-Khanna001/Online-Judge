import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProblemListPage = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        // This is a public route, so no token is needed
        const res = await axios.get('http://localhost:5000/api/problems');
        setProblems(res.data);
      } catch (err) {
        console.error('Failed to fetch problems:', err);
      }
    };
    fetchProblems();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Problem Set</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
          Logout
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">All Problems</h2>
        <div className="space-y-4">
          {problems.map(problem => (
            <div key={problem._id} className="border-b pb-4">
              <h3 className="text-xl font-semibold">{problem.name} <span className={`text-xs font-medium align-middle ml-2 px-2.5 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{problem.difficulty}</span></h3>
              <p className="text-gray-600 mt-2">{problem.statement}</p>
              {/* In the future, you can add a "Solve" button here */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProblemListPage;
