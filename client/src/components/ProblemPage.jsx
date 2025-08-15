import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProblemPage = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [displayedTestCases, setDisplayedTestCases] = useState([]);
    const [code, setCode] = useState(`function solve() {\n  // Your code here\n}`);
    const [customInput, setCustomInput] = useState('');

    // --- State and Refs for Resizing ---
    const [topPaneHeight, setTopPaneHeight] = useState(65); // Initial height of code editor in %
    const isResizing = useRef(false);
    const resizableContainerRef = useRef(null);

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

    const handleIncludeCustomTestCase = () => {
        if (!customInput.trim()) {
            alert('Custom input cannot be empty.');
            return;
        }
        const newCustomCase = {
            _id: `custom-${Date.now()}`,
            input: customInput,
            expectedOutput: '(Run code to see output)',
            isCustom: true
        };
        setDisplayedTestCases([...displayedTestCases, newCustomCase]);
        setCustomInput('');
    };

    // --- Resizing Logic ---
    const handleMouseDown = (e) => {
        isResizing.current = true;
        // Attach listeners to the window to capture mouse movement everywhere
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isResizing.current) return;
        
        const container = resizableContainerRef.current;
        if (!container) return;

        const containerTop = container.getBoundingClientRect().top;
        const containerHeight = container.offsetHeight;
        
        // Calculate the new height of the top pane as a percentage
        let newHeightPercent = ((e.clientY - containerTop) / containerHeight) * 100;

        // Add constraints to prevent panes from becoming too small
        if (newHeightPercent < 20) newHeightPercent = 20;
        if (newHeightPercent > 80) newHeightPercent = 80;

        setTopPaneHeight(newHeightPercent);
    };

    const handleMouseUp = () => {
        isResizing.current = false;
        // Clean up global event listeners
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    if (!problem) {
        return <div className="min-h-screen flex items-center justify-center">Loading Problem...</div>;
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans">
            {/* Left Section: Problem Details */}
            <div className="w-full md:w-2/5 p-6 bg-white overflow-y-auto">
                <Link to="/problems" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Problems</Link>
                <h1 className="text-3xl font-bold mb-2">{problem.name}</h1>
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{problem.difficulty}</span>
                <p className="text-gray-700 mt-4 whitespace-pre-wrap">{problem.statement}</p>
            </div>

            {/* Right Section: Code Editor and Test Cases */}
            <div className="w-full md:w-3/5 flex flex-col">
                <div className="p-2 flex-shrink-0 border-b bg-white">
                    <button className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600">Run</button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Submit</button>
                </div>

                {/* This container will hold the resizable panes */}
                <div ref={resizableContainerRef} className="flex-grow flex flex-col">
                    {/* Right Upper Section: Code Editor */}
                    <div className="p-4" style={{ height: `${topPaneHeight}%` }}>
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="w-full h-full bg-[#282a36] text-[#f8f8f2] font-mono text-sm p-4 rounded-lg focus:outline-none resize-none"
                            style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 14 }}
                        />
                    </div>

                    {/* Draggable Handle */}
                    <div
                        className="w-full h-2 bg-gray-300 cursor-row-resize hover:bg-blue-400 transition-colors flex-shrink-0"
                        onMouseDown={handleMouseDown}
                    />

                    {/* Right Lower Section: Test Cases */}
                    <div className="p-4 bg-white overflow-y-auto" style={{ height: `${100 - topPaneHeight}%` }}>
                        <h2 className="text-xl font-semibold mb-2">Test Cases</h2>
                        <div className="space-y-4 mb-4">
                            {displayedTestCases.map((tc, index) => (
                                <div key={tc._id} className={`border rounded-lg p-3 ${tc.isCustom ? 'border-blue-300 bg-blue-50' : 'bg-gray-50'}`}>
                                    <h3 className="font-bold">{tc.isCustom ? `Custom Case #${index + 1 - displayedTestCases.filter(c => !c.isCustom).length}` : `Sample Case #${index + 1}`}</h3>
                                    <div className="mt-2">
                                        <label className="text-xs font-semibold">Input:</label>
                                        <pre className="bg-gray-200 p-2 rounded text-sm mt-1 whitespace-pre-wrap">{tc.input}</pre>
                                    </div>
                                    <div className="mt-2">
                                        <label className="text-xs font-semibold">Output:</label>
                                        <pre className="bg-gray-200 p-2 rounded text-sm mt-1 whitespace-pre-wrap">{tc.expectedOutput}</pre>
                                    </div>
                                </div>
                            ))}
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
                            <button onClick={handleIncludeCustomTestCase} className="bg-gray-600 text-white px-4 py-2 rounded mt-2 hover:bg-gray-700">
                                Include
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemPage;
