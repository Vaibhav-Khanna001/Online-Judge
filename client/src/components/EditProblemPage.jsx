import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const EditProblemPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState({
        name: '',
        statement: '',
        difficulty: 'Easy',
        solutionCode: {
            cpp: '',
            py: '',
            java: ''
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                // Note: Using a general, non-authenticated endpoint to fetch problem details
                const res = await axios.get(`http://localhost:5000/api/problems/${id}`);
                // Ensure solutionCode is an object, even if it's missing from the DB
                const fetchedProblem = {
                    ...res.data.problem,
                    solutionCode: res.data.problem.solutionCode || { cpp: '', py: '', java: '' }
                };
                setProblem(fetchedProblem);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Failed to load problem for editing.');
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProblem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSolutionCodeChange = (e) => {
        const { name, value } = e.target; // name will be "cpp", "py", or "java"
        setProblem(prev => ({
            ...prev,
            solutionCode: {
                ...prev.solutionCode,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Use an authenticated API instance for the update operation
            const api = axios.create({
                headers: { 'x-auth-token': localStorage.getItem('token') },
            });
            await api.put(`http://localhost:5000/api/problems/${id}`, problem);
            alert('Problem updated successfully!');
            navigate(`/admin`); // Redirect to the admin dashboard after update
        } catch (err) {
            console.error('Failed to update problem:', err);
            alert('Error updating problem. Check console for details.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Problem Editor...</div>;
    }

    return (
        <div className="container mx-auto p-8">
            <Link to="/admin" className="text-blue-500 hover:underline mb-6 inline-block">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold mb-6">Edit Problem: {problem.name}</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Problem Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={problem.name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="statement" className="block text-sm font-medium text-gray-700">Problem Statement</label>
                    <textarea
                        name="statement"
                        id="statement"
                        value={problem.statement}
                        onChange={handleChange}
                        rows="10"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                        name="difficulty"
                        id="difficulty"
                        value={problem.difficulty}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                    </select>
                </div>

                <hr />

                <h2 className="text-xl font-semibold">Solution Code</h2>
                
                <div>
                    <label htmlFor="cpp" className="block text-sm font-medium text-gray-700">C++ Solution</label>
                    <textarea
                        name="cpp"
                        id="cpp"
                        value={problem.solutionCode.cpp}
                        onChange={handleSolutionCodeChange}
                        rows="12"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono bg-gray-50"
                        placeholder="Enter the C++ solution code here..."
                    />
                </div>
                
                <div>
                    <label htmlFor="py" className="block text-sm font-medium text-gray-700">Python Solution</label>
                    <textarea
                        name="py"
                        id="py"
                        value={problem.solutionCode.py}
                        onChange={handleSolutionCodeChange}
                        rows="12"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono bg-gray-50"
                        placeholder="Enter the Python solution code here..."
                    />
                </div>

                <div>
                    <label htmlFor="java" className="block text-sm font-medium text-gray-700">Java Solution</label>
                    <textarea
                        name="java"
                        id="java"
                        value={problem.solutionCode.java}
                        onChange={handleSolutionCodeChange}
                        rows="12"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono bg-gray-50"
                        placeholder="Enter the Java solution code here..."
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProblemPage;