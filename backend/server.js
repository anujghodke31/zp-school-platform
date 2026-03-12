const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load env vars first — must be before any process.env reads
dotenv.config();

// Initialize Firebase Admin
require('./firebase');

const app = express();

// CORS — restrict to known origins; set ALLOWED_ORIGINS in .env as comma-separated list
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ─── SSE — Redis Pub/Sub with in-memory fallback ─────────────────────────────
let sseClients = [];

let redisSubscriber = null;
let redisPublisher = null;

if (process.env.REDIS_URL) {
    const Redis = require('ioredis');
    redisPublisher = new Redis(process.env.REDIS_URL);
    redisSubscriber = new Redis(process.env.REDIS_URL);

    redisSubscriber.subscribe('zp:notices', (err) => {
        if (err) console.error('Redis subscribe error:', err.message);
        else console.log('SSE: Redis Pub/Sub active on channel zp:notices');
    });

    redisSubscriber.on('message', (channel, message) => {
        sseClients.forEach(client => client.write(`data: ${message}\n\n`));
    });

    redisPublisher.on('error', (err) => console.error('Redis publisher error:', err.message));
    redisSubscriber.on('error', (err) => console.error('Redis subscriber error:', err.message));
} else {
    console.log('SSE: REDIS_URL not set — using in-memory broadcast (single instance only)');
}

// SSE stream endpoint
app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    sseClients.push(res);

    const keepAlive = setInterval(() => res.write(': keepalive\n\n'), 20000);

    req.on('close', () => {
        clearInterval(keepAlive);
        sseClients = sseClients.filter(c => c !== res);
    });
});

// Broadcast helper — uses Redis if configured, else in-memory
app.broadcastNotice = (type, title, message) => {
    const data = JSON.stringify({ type, title, message });
    if (redisPublisher) {
        redisPublisher.publish('zp:notices', data);
    } else {
        sseClients.forEach(client => client.write(`data: ${data}\n\n`));
    }
};

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/data', require('./routes/data'));

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
