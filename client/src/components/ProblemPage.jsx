import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProblemPage = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [displayedTestCases, setDisplayedTestCases] = useState([]);
    const [code, setCode] = useState('');
    const [customInput, setCustomInput] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [runResults, setRunResults] = useState({});
    const [isRunning, setIsRunning] = useState(false);
    const [isIncludingCustomCase, setIsIncludingCustomCase] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topPaneHeight, setTopPaneHeight] = useState(65);
    const isResizing = useRef(false);
    const resizableContainerRef = useRef(null);

    const boilerplates = {
        cpp: `#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    // Your C++ code here\n    std::cout << "Hello World";\n    return 0;\n}`,
        py: `# Your Python code here\ndef solve():\n    # Read input if necessary\n    # For example: line = input()\n    print("Hello World")\n\nsolve()`,
        java: `class Main {\n    public static void main(String[] args) {\n        // Your Java code here\n        System.out.println("Hello World");\n    }\n}`
    };

    useEffect(() => {
        setCode(boilerplates[language]);
    }, [language]);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/problems/${id}`);
                setProblem(res.data.problem);
                setDisplayedTestCases(res.data.testCases);
            } catch (err) {
                console.error(err);
                alert('Failed to load problem.');
            }
        };
        fetchProblem();
    }, [id]);

    const handleIncludeCustomTestCase = async () => {
        if (!customInput.trim()) {
            alert('Custom input cannot be empty.');
            return;
        }
        setIsIncludingCustomCase(true);

        try {
            const api = axios.create({
                headers: { 'x-auth-token': localStorage.getItem('token') },
            });
            // --- FIX: Added the 'language' to the request payload ---
            const response = await api.post(`http://localhost:5000/api/run/solution`, {
                problemId: id,
                input: customInput,
                language: language, // This was the missing piece
            });

            const newCustomCase = {
                _id: `custom-${Date.now()}`,
                input: customInput,
                expectedOutput: response.data.output,
                isCustom: true
            };
            setDisplayedTestCases([...displayedTestCases, newCustomCase]);
            setCustomInput('');
        } catch (err) {
            console.error("Failed to generate expected output:", err);
            alert('Could not generate the expected output for your custom input. Please try again.');
        } finally {
            setIsIncludingCustomCase(false);
        }
    };
    
    const handleRunCode = async () => {
        setIsRunning(true);
        setRunResults({});
        const newResults = {};

        const api = axios.create({
            headers: { 'x-auth-token': localStorage.getItem('token') },
        });

        for (const tc of displayedTestCases) {
            try {
                const response = await api.post('http://localhost:5000/api/run', {
                    language,
                    code,
                    input: tc.input,
                });
                newResults[tc._id] = { success: true, output: response.data.output };
            } catch (error) {
                const errorMsg = error.response ? error.response.data.error : "Network Error";
                newResults[tc._id] = { success: false, output: errorMsg };
            }
        }
        setRunResults(newResults);
        setIsRunning(false);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmissionResult(null);
        try {
            const api = axios.create({
                headers: { 'x-auth-token': localStorage.getItem('token') },
            });
            const response = await api.post('http://localhost:5000/api/submit', {
                language,
                code,
                problemId: id,
            });
            setSubmissionResult(response.data);
            setIsModalOpen(true);
        } catch (error) {
            const errorMsg = error.response ? error.response.data.message : "Network Error";
            setSubmissionResult({ verdict: 'Error', message: errorMsg });
            setIsModalOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMouseDown = (e) => {
        isResizing.current = true;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isResizing.current) return;
        const container = resizableContainerRef.current;
        if (!container) return;
        const containerTop = container.getBoundingClientRect().top;
        const containerHeight = container.offsetHeight;
        let newHeightPercent = ((e.clientY - containerTop) / containerHeight) * 100;
        if (newHeightPercent < 20) newHeightPercent = 20;
        if (newHeightPercent > 80) newHeightPercent = 80;
        setTopPaneHeight(newHeightPercent);
    };

    const handleMouseUp = () => {
        isResizing.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    if (!problem) {
        return <div className="min-h-screen flex items-center justify-center">Loading Problem...</div>;
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans">
            {/* Left Section */}
            <div className="w-full md:w-2/5 p-6 bg-white overflow-y-auto">
                <Link to="/problems" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Problems</Link>
                <h1 className="text-3xl font-bold mb-2">{problem.name}</h1>
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{problem.difficulty}</span>
                <p className="text-gray-700 mt-4 whitespace-pre-wrap">{problem.statement}</p>
            </div>

            {/* Right Section */}
            <div className="w-full md:w-3/5 flex flex-col">
                <div className="p-2 flex-shrink-0 border-b bg-white flex justify-between items-center">
                    <div>
                        <button onClick={handleRunCode} disabled={isRunning || isSubmitting} className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 disabled:bg-gray-400">
                            {isRunning ? 'Running...' : 'Run'}
                        </button>
                        <button onClick={handleSubmit} disabled={isSubmitting || isRunning} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                    <div>
                        <label htmlFor="language" className="mr-2 font-medium">Language:</label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="cpp">C++</option>
                            <option value="py">Python</option>
                            <option value="java">Java</option>
                        </select>
                    </div>
                </div>
                <div ref={resizableContainerRef} className="flex-grow flex flex-col">
                    <div className="p-4" style={{ height: `${topPaneHeight}%` }}>
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="w-full h-full bg-[#282a36] text-[#f8f8f2] font-mono text-sm p-4 rounded-lg focus:outline-none resize-none"
                            style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 14 }}
                        />
                    </div>
                    <div className="w-full h-2 bg-gray-300 cursor-row-resize hover:bg-blue-400 transition-colors flex-shrink-0" onMouseDown={handleMouseDown} />
                    <div className="p-4 bg-white overflow-y-auto" style={{ height: `${100 - topPaneHeight}%` }}>
                        <h2 className="text-xl font-semibold mb-2">Test Cases</h2>
                        <div className="space-y-4 mb-4">
                            {displayedTestCases.map((tc, index) => {
                                const result = runResults[tc._id];
                                const isCorrect = result && result.success && result.output.trim() === tc.expectedOutput.trim();
                                
                                return (
                                    <div key={tc._id} className={`border rounded-lg p-3 ${tc.isCustom ? 'border-blue-300 bg-blue-50' : 'bg-gray-50'}`}>
                                        <h3 className="font-bold">{tc.isCustom ? `Custom Case #${index + 1 - displayedTestCases.filter(c => !c.isCustom).length}` : `Sample Case #${index + 1}`}</h3>
                                        <div className="mt-2">
                                            <label className="text-xs font-semibold">Input:</label>
                                            <pre className="bg-gray-200 p-2 rounded text-sm mt-1 whitespace-pre-wrap">{tc.input}</pre>
                                        </div>
                                        <div className="mt-2">
                                            <label className="text-xs font-semibold">Expected Output:</label>
                                            <pre className="bg-gray-200 p-2 rounded text-sm mt-1 whitespace-pre-wrap">{tc.expectedOutput}</pre>
                                        </div>
                                        {result && (
                                            <div className="mt-2">
                                                <label className={`text-xs font-semibold ${result.success && isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                    { !result.success ? 'Error:' : 'Your Output:' }
                                                    { result.success && !isCorrect && <span className="font-bold"> (Wrong Answer)</span> }
                                                    { result.success && isCorrect && <span className="font-bold"> (Correct)</span> }
                                                </label>
                                                <pre className={`p-2 rounded text-sm mt-1 whitespace-pre-wrap ${result.success && isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    {result.output}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">Custom Input</h3>
                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Enter your custom input here..."
                                rows="3"
                            />
                            <button 
                                onClick={handleIncludeCustomTestCase} 
                                disabled={isIncludingCustomCase}
                                className="bg-gray-600 text-white px-4 py-2 rounded mt-2 hover:bg-gray-700 disabled:bg-gray-400"
                            >
                                {isIncludingCustomCase ? 'Generating...' : 'Include'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && submissionResult && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className={`bg-white p-8 rounded-lg shadow-2xl text-center w-full max-w-md ${
                        submissionResult.verdict === 'Successful' ? 'border-t-8 border-green-500' : 'border-t-8 border-red-500'
                    }`}>
                        <h2 className={`text-3xl font-bold mb-4 ${
                            submissionResult.verdict === 'Successful' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {submissionResult.verdict}
                        </h2>
                        <p className="text-gray-700 mb-6">{submissionResult.message}</p>
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemPage;
