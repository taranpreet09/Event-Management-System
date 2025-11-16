require('dotenv').config();
const { dequeue, NOTIFICATION_QUEUE_KEY } = require('../utils/queue');
const { redisClient } = require('../config/redis');

async function startNotificationWorker() {
  console.log('🔔 Notification worker started, waiting for jobs...');

  while (true) {
    try {
      const job = await dequeue(NOTIFICATION_QUEUE_KEY, 0); // block forever
      if (!job) continue;

      const { payload } = job;
      if (!payload || !payload.type) {
        console.warn('Notification worker received invalid job', job);
        continue;
      }

      const { type } = payload;

      if (type === 'EVENT_ADDED' || type === 'EVENT_DELETED') {
        const channel = 'event-updates';
        const message = JSON.stringify(payload);
        await redisClient.publish(channel, message);
        console.log(`🔔 Published ${type} to '${channel}'`);
      } else if (type === 'BROADCAST_MESSAGE') {
        const channel = 'notifications';
        const message = JSON.stringify(payload);
        await redisClient.publish(channel, message);
        console.log(`🔔 Published BROADCAST_MESSAGE to '${channel}'`);
      } else {
        console.warn('Notification worker: unknown job type', type);
      }
    } catch (err) {
      console.error('❌ Notification worker error:', err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

startNotificationWorker().catch((err) => {
  console.error('Fatal notification worker error:', err);
  process.exit(1);
});
