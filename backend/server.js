require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');

const connectDB = require('./config/db');
const { redisClient } = require('./config/redis');
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

// Helper: find a client by userId
const findClientByUserId = (userId) => {
  for (const client of wss.clients) {
    if (client.readyState === 1 && client.user?.id === userId) {
      return client;
    }
  }
  return null;
};

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected!' }));

  ws.on('message', async (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    // ─── AUTH ───
    if (data.type === 'AUTH') {
      try {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        ws.user = decoded.user;
        ws.send(JSON.stringify({ type: 'AUTH_OK' }));
        console.log(`🔑 [WS] Authenticated: ${ws.user.name} (${ws.user.id})`);
      } catch {
        ws.send(JSON.stringify({ type: 'AUTH_ERROR' }));
      }
      return;
    }

    // ─── SEND INBOX MESSAGE ───
    if (data.type === 'SEND_INBOX_MESSAGE') {
      if (!ws.user?.id) return;

      const { conversationId, text } = data;
      if (!conversationId || !text) return;

      try {
        const convo = await Conversation.findById(conversationId);
        if (!convo) return;

        // Determine recipient: if sender is organizer, send to attendee; otherwise send to organizer
        const senderId = ws.user.id;
        const isOrganizer = convo.organizer.toString() === senderId;
        const recipientId = isOrganizer ? convo.attendee.toString() : convo.organizer.toString();

        // Get sender details
        const senderUser = await User.findById(senderId).select('name');
        const senderName = senderUser?.name || ws.user.name || 'User';

        // Save message to DB
        const message = await Message.create({
          conversation: convo._id,
          from: senderId,
          to: recipientId,
          text: text.trim(),
        });

        // Update conversation preview
        convo.lastMessagePreview = text.trim().substring(0, 100);
        convo.lastMessageAt = new Date();
        await convo.save();

        // Build full message payload
        const messagePayload = {
          type: 'INBOX_MESSAGE',
          messageId: message._id.toString(),
          conversationId: convo._id.toString(),
          text: text.trim(),
          fromUserId: senderId,
          fromName: senderName,
          toUserId: recipientId,
          eventId: convo.event?.toString(),
          createdAt: message.createdAt,
        };

        // Direct delivery to recipient if they're connected
        const recipientWs = findClientByUserId(recipientId);
        if (recipientWs) {
          recipientWs.send(JSON.stringify(messagePayload));
        }

        // Also publish via Redis for any other server instances
        await redisClient.publish('notifications', JSON.stringify(messagePayload));

        // Confirm to sender
        ws.send(JSON.stringify({
          type: 'SEND_OK',
          messageId: message._id.toString(),
          conversationId: convo._id.toString(),
        }));

      } catch (err) {
        console.error('❌ [WS] SEND_INBOX_MESSAGE error:', err);
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
