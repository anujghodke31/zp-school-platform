const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve SSE Stream Clients
let sseClients = [];
app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'close'); // Note: For true keep-alive we change this to 'keep-alive', adjusting for simplicity in Vite proxying

    // Add Client
    sseClients.push(res);

    // Keey-alive interval
    const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
    }, 20000);

    req.on('close', () => {
        clearInterval(keepAlive);
        sseClients = sseClients.filter(client => client !== res);
    });
});

// Broadcast Helper
app.broadcastNotice = (type, title, message) => {
    const data = JSON.stringify({ type, title, message });
    sseClients.forEach(client => client.write(`data: ${data}\n\n`));
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/data', require('./routes/data'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
