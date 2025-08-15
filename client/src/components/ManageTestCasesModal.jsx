import  { useState, useEffect } from 'react';
import axios from 'axios';

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

  // Fetch all test cases for this problem when the modal opens
  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        const res = await api.get(`/testcases/${problemId}`);
        setTestCases(res.data);
      } catch (err) {
        console.log(err);
        console.error('Failed to fetch test cases', err);
      }
    };
    fetchTestCases();
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
      setFormData({ input: '', expectedOutput: '', isSample: false }); // Clear form
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
        
        {/* Form to Add New Test Case */}
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
        
        {/* List of Existing Test Cases */}
        <div className="flex-grow overflow-y-auto">
          <h3 className="text-xl font-bold mb-2">Existing Test Cases</h3>
          {testCases.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {testCases.map((tc) => (
                <li key={tc._id} className="py-3 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Input: <pre className="bg-gray-100 p-1 rounded inline-block">{tc.input}</pre></p>
                    <p className="text-sm text-gray-500 mt-1">Output: <pre className="bg-gray-100 p-1 rounded inline-block">{tc.expectedOutput}</pre></p>
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

export default ManageTestCasesModal;