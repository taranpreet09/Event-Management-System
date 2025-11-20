const { subscriberClient } = require('../config/redis');

const startSubscriber = async (wss) => {
 console.log('Attempting to start Redis Subscriber...');

if (!wss) {
 console.error('❌ FATAL: WebSocket server (wss) not provided to subscriber.');
 return;
 }

 try {
 await subscriberClient.connect();
 console.log('✅ [Pub/Sub] Redis Subscriber Client Connected.');
 
 const listener = (message, channel) => {
 console.log(`🎁 [Pub/Sub] RECEIVED message from channel '${channel}'`);
 
wss.clients.forEach((client) => {
 if (client.readyState === 1) { 
 client.send(message); 
 }
 });
 };
 
 await subscriberClient.subscribe(['event-updates', 'notifications'], listener);

 console.log("✅ [Pub/Sub] Now subscribed to 'event-updates' AND 'notifications'...");

 } catch (err) {
 console.error('❌ [Pub/Sub] Failed to start Redis Subscriber:', err);
 }
};

module.exports = { startSubscriber };