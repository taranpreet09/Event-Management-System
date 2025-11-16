require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// --- NEW IMPORTS FOR REAL-TIME ---
const http = require('http'); 
const { WebSocketServer } = require('ws'); 
const { startSubscriber } = require('./services/notificationService'); 
const { redisClient } = require('./config/redis');

// --- Connect DB ---
connectDB();

const app = express();

// 🛑 CORRECTION START: Configure CORS to allow your frontend's port
app.use(
    cors({
        // 1. Allow only your frontend's origin (Vite dev server)
        origin: 'http://localhost:5173', 
        // 2. Allow credentials (important for auth tokens/cookies)
        credentials: true, 
        // 3. Allow all common methods
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        // 4. Allow headers, especially your custom auth header
        allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'], 
    })
);
// 🛑 CORRECTION END

app.use(express.json());

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users')); 
app.use('/api/broadcast', require('./routes/broadcast'));
app.use('/api/messages', require('./routes/messages'));
app.get('/', (req, res) => {
    res.send('API is running...');
});

// TEMP TEST ROUTE for pub/sub
app.post('/api/test-pubsub', async (req, res) => {
  try {
    const message = JSON.stringify({
      type: 'BROADCAST_MESSAGE',
      payload: {
        id: 'test-from-http',
        title: 'Test Broadcast via HTTP',
        text: 'Hello from /api/test-pubsub',
      },
    });

    const result = await redisClient.publish('notifications', message);
    console.log('TEST /api/test-pubsub → published to notifications, result:', result);

    res.json({ ok: true, published: result });
  } catch (err) {
    console.error('TEST /api/test-pubsub error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
console.log('✅ WebSocket Server Initialized');

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected!' }));
});

startSubscriber(wss);

const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));