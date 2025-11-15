const { subscriberClient } = require('../config/redis');

const startSubscriber = async (wss) => {
 console.log('Attempting to start Redis Subscriber...');

if (!wss) {
 console.error('❌ FATAL: WebSocket server (wss) not provided to subscriber.');
 return;
 }

 try {
 // 1. Confirmation of connection
 await subscriberClient.connect();
 console.log('✅ [Pub/Sub] Redis Subscriber Client Connected.');
 
 // This is the listener function that waits for messages
 const listener = (message, channel) => {
// 3. Confirmation of a received message
 console.log(`🎁 [Pub/Sub] RECEIVED message from channel '${channel}'`);
 
 // Loop and send to all connected clients
wss.clients.forEach((client) => {
 if (client.readyState === 1) { // 1 = WebSocket.OPEN
 client.send(message); 
 }
 });
 };
 
 // Subscribe to the channel and attach the listener
  // ⭐ LINE 1 TO CHANGE: Subscribe to an array of channels
 await subscriberClient.subscribe(['event-updates', 'notifications'], listener);

 // 2. Confirmation that you are now listening
  // ⭐ LINE 2 TO CHANGE: Update the confirmation log
 console.log("✅ [Pub/Sub] Now subscribed to 'event-updates' AND 'notifications'...");

 } catch (err) {
 console.error('❌ [Pub/Sub] Failed to start Redis Subscriber:', err);
 }
};

module.exports = { startSubscriber };