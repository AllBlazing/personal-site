require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Add a basic route handler
app.get('/', (req, res) => {
    console.log('Received request for /');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Add route handlers for other static files
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

// Strava API credentials
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;

// Add error handling middleware (moved to the end)
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Something broke!');
});

// Start the server with error handling
try {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
        console.log(`Try accessing: http://localhost:${port}`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
} 