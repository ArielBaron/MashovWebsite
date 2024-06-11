const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const fetchBehavior = require('./mashov/behavior');
const fetchGrades = require('./mashov/grades');
const fetchTimetable = require('./mashov/timetable');

const app = express();
const PORT = 3000;

// Set up Multer for handling file uploads
const upload = multer({ dest: 'uploads/' });


app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve the frontend HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

let loginInfo = null;

// Endpoint for handling file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        // Read the uploaded file
        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const credentials = JSON.parse(fileContent);

        // Save loginInfo to use in other endpoints
        loginInfo = credentials;

        // Send success response
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to log in to Mashov' });
    } finally {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
    }
});

// Endpoint for fetching behavior data
app.get('/behavior', async (req, res) => {
    try {
        if (!loginInfo) {
            return res.status(400).json({ error: 'Not logged in to Mashov' });
        }

        const behavior = await fetchBehavior(loginInfo);
        res.json(behavior);
    } catch (error) {
        console.error('Error fetching behavior data:', error);
        res.status(500).json({ error: 'Failed to fetch behavior data' });
    }
});

// Endpoint for fetching grades data
app.get('/grades', async (req, res) => {
    try {
        if (!loginInfo) {
            return res.status(400).json({ error: 'Not logged in to Mashov' });
        }

        const grades = await fetchGrades(loginInfo);
        res.json(grades);
    } catch (error) {
        console.error('Error fetching grades data:', error);
        res.status(500).json({ error: 'Failed to fetch grades data' });
    }
});

// Endpoint for fetching timetable data
app.get('/timetable', async (req, res) => {
    try {
        if (!loginInfo) {
            return res.status(400).json({ error: 'Not logged in to Mashov' });
        }

        const timetable = await fetchTimetable(loginInfo);
        res.json(timetable);
    } catch (error) {
        console.error('Error fetching timetable data:', error);
        res.status(500).json({ error: 'Failed to fetch timetable data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
