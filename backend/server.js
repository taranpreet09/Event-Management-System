require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const http = require('http');
const { WebSocketServer } = require('ws');
const { startSubscriber } = require('./services/notificationService');
const { redisClient } = require('./config/redis');
const jwt = require('jsonwebtoken');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Event = require('./models/Event');
const User = require('./models/User');

connectDB();

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173', 
        credentials: true, 
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'], 
    })
);

app.use(express.json());

// Serve local uploads (development/testing)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users')); 
app.use('/api/broadcast', require('./routes/broadcast'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/uploads', require('./routes/uploads'));
app.get('/', (req, res) => {
    res.send('API is running...');
});

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
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected!' }));

  ws.on('message', async (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (data.type === 'AUTH') {
      try {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        ws.user = { id: decoded.user.id, role: decoded.user.role, name: decoded.user.name };
        ws.send(JSON.stringify({ type: 'AUTH_OK' }));
      } catch {
        ws.send(JSON.stringify({ type: 'AUTH_ERROR' }));
      }
      return;
    }

    if (data.type === 'SEND_INBOX_MESSAGE') {
      if (!ws.user || !ws.user.id) return;
      const { conversationId, text } = data;
      if (!conversationId || !text || !text.trim()) return;

      try {
        const convo = await Conversation.findById(conversationId);
        if (!convo) return;

        const isParticipant =
          convo.organizer.toString() === ws.user.id.toString() ||
          convo.attendee.toString() === ws.user.id.toString();
        if (!isParticipant) return;

        const from = ws.user.id;
        const to =
          convo.organizer.toString() === ws.user.id.toString()
            ? convo.attendee.toString()
            : convo.organizer.toString();

        const message = await Message.create({
          conversation: convo._id,
          from,
          to,
          text: text.trim(),
        });

        convo.lastMessageAt = new Date();
        convo.lastMessagePreview = text.trim().slice(0, 140);
        await convo.save();

        const fromUser = await User.findById(from).select('name');
        const payload = {
          type: 'INBOX_MESSAGE',
          toUserId: to,
          fromUserId: from,
          eventId: convo.event.toString(),
          conversationId: convo._id.toString(),
          fromName: fromUser?.name || 'User',
          text: text.trim(),
          messageId: message._id.toString(),
        };

        await redisClient.publish('notifications', JSON.stringify(payload));
        ws.send(
          JSON.stringify({
            type: 'SEND_OK',
            conversationId: convo._id.toString(),
            messageId: message._id.toString(),
          })
        );
      } catch {
        ws.send(JSON.stringify({ type: 'SEND_ERROR' }));
      }
    }
  });
});

startSubscriber(wss);

const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));