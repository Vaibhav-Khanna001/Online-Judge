const mongoose = require('mongoose');

// Defines the structure for each problem in the database.
const ProblemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    statement: { 
        type: String, 
        required: true 
    },
    difficulty: { 
        type: String, 
        required: true, 
        enum: ['Easy', 'Medium', 'Hard'] 
    },
    
    solutionCode: {
        cpp: { type: String, default: '' },
        py: { type: String, default: '' },
        java: { type: String, default: '' }
    }
});

module.exports = mongoose.model('Problem', ProblemSchema);
