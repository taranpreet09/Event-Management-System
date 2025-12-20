require('dotenv').config();
const { dequeue, NOTIFICATION_QUEUE_KEY } = require('../utils/queue');
const { redisClient } = require('../config/redis'); // ✅ ONLY THIS

async function startNotificationWorker() {
  console.log('🔔 Notification worker started, waiting for jobs...');

  while (true) {
    try {
      const job = await dequeue(NOTIFICATION_QUEUE_KEY, 0);
      if (!job) continue;

      const { payload } = job;
      if (!payload || !payload.type) continue;

      const channel =
        payload.type === 'EVENT_ADDED' || payload.type === 'EVENT_DELETED'
          ? 'event-updates'
          : 'notifications';

      await redisClient.publish(channel, JSON.stringify(payload));
      console.log(`🔔 Published ${payload.type} to ${channel}`);
    } catch (err) {
      console.error('❌ Notification worker error:', err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

startNotificationWorker().catch((err) => {
  console.error('Fatal notification worker error:', err);
  process.exit(1);
});
