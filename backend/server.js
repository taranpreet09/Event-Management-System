require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');

const connectDB = require('./config/db');
const { redisClient } = require('./config/redis');   // ✅ only this
const { startSubscriber } = require('./services/notificationService');

const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const User = require('./models/User');

const app = require('./app');

// 🔗 DB connect
connectDB();

const server = http.createServer(app);

// 🔌 WebSocket setup
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
        ws.user = decoded.user;
        ws.send(JSON.stringify({ type: 'AUTH_OK' }));
      } catch {
        ws.send(JSON.stringify({ type: 'AUTH_ERROR' }));
      }
      return;
    }

    if (data.type === 'SEND_INBOX_MESSAGE') {
      if (!ws.user?.id) return;

      const { conversationId, text } = data;
      if (!conversationId || !text) return;

      try {
        const convo = await Conversation.findById(conversationId);
        if (!convo) return;

        const message = await Message.create({
          conversation: convo._id,
          from: ws.user.id,
          to: convo.organizer,
          text: text.trim(),
        });

        await redisClient.publish(
          'notifications',
          JSON.stringify({
            type: 'INBOX_MESSAGE',
            messageId: message._id,
          })
        );

        ws.send(JSON.stringify({ type: 'SEND_OK' }));
      } catch {
        ws.send(JSON.stringify({ type: 'SEND_ERROR' }));
      }
    }
  });
});

// 🔔 Redis subscriber
startSubscriber(wss);

// 🚀 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
