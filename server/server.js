const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS for all routes

const PORT = 8000;

/**
 * Endpoint to predict house prices.
 * Expects a JSON body with:
 * {
 * "location": "Cipayung, Jakarta Timur",
 * "bedrooms": 3,
 * "toilet": 2,
 * "garage": 1,
 * "LT": 60,
 * "LB": 70
 * }
 */
app.post('/predict', (req, res) => {
    const { location, bedrooms, toilet, garage, LT, LB } = req.body;

    // --- 1. Input Validation ---
    if (!location || bedrooms == null || toilet == null || garage == null || LT == null || LB == null) {
        return res.status(400).json({ error: 'Missing required fields: location, bedrooms, toilet, garage, LT, LB' });
    }

    // --- 2. Call the Python Script ---
    const pythonExecutable = './model/property/env/Scripts/python.exe';
    const pythonScript = './model/property/predict_for_api.py';
    
    // Check if the venv python exists
    const fs = require('fs');
    if (!fs.existsSync(pythonExecutable)) {
        console.error(`Error: Python executable not found at ${pythonExecutable}`);
        return res.status(500).json({ 
            error: 'Server configuration error.', 
            details: `Python virtual environment not found at ${pythonExecutable}` 
        });
    }

    // Call the Python script using the venv executable
    const pythonProcess = spawn(pythonExecutable, [
        pythonScript,
        location,
        bedrooms,
        toilet,
        garage,
        LT,
        LB
    ]);


    let pythonOutput = '';
    let pythonError = '';

    // --- 3. Capture Output ---
    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            try {
                const errorJson = JSON.parse(pythonError);
                return res.status(500).json({ error: 'Python script failed', details: errorJson.message });
            } catch (e) {
                return res.status(500).json({ error: 'Python script failed', details: pythonError });
            }
        }

        try {
            const resultJson = JSON.parse(pythonOutput);
            res.status(200).json(resultJson);
        } catch (e) {
            res.status(500).json({ 
                error: 'Failed to parse JSON output from Python script', 
                raw_output: pythonOutput,
                parse_error: e.message
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Express API server running on http://localhost:${PORT}`);
});