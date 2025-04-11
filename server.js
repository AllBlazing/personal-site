require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Strava API credentials
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;

const http = require('http');

const server = http.createServer((req, res) => {
    // Get the file path
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Get the file extension
    let extname = path.extname(filePath);
    
    // Set the content type
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    // Read the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Page not found
                fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Update token endpoint
app.post('/api/update-token', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const envPath = path.join(__dirname, '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Update or add POLAR_ACCESS_TOKEN
        if (envContent.includes('POLAR_ACCESS_TOKEN=')) {
            envContent = envContent.replace(
                /POLAR_ACCESS_TOKEN=.*/,
                `POLAR_ACCESS_TOKEN=${token}`
            );
        } else {
            envContent += `\nPOLAR_ACCESS_TOKEN=${token}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating token:', error);
        res.status(500).json({ error: 'Failed to update token' });
    }
});

// Polar API proxy endpoints
app.get('/api/polar/vo2max', async (req, res) => {
    try {
        const response = await fetch(
            `https://www.polaraccesslink.com/v3/users/${process.env.POLAR_USER_ID}/vo2max`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching VO2Max:', error);
        res.status(500).json({ error: 'Failed to fetch VO2Max data' });
    }
});

app.get('/api/polar/hrv', async (req, res) => {
    try {
        const response = await fetch(
            `https://www.polaraccesslink.com/v3/users/${process.env.POLAR_USER_ID}/hrv`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching HRV:', error);
        res.status(500).json({ error: 'Failed to fetch HRV data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 