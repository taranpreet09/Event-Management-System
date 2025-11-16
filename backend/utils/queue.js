const { redisClient } = require('../config/redis');

// List keys
const EMAIL_QUEUE_KEY = 'queue:emails';
const NOTIFICATION_QUEUE_KEY = 'queue:notifications';

// Generic enqueue
async function enqueue(queueKey, payload) {
  const job = JSON.stringify({
    payload,
    enqueuedAt: new Date().toISOString(),
  });
  await redisClient.lPush(queueKey, job);
}

// Generic blocking dequeue (BRPOP)
async function dequeue(queueKey, timeoutSeconds = 0) {
  // BRPOP returns [key, value] or null on timeout
  const result = await redisClient.brPop(queueKey, timeoutSeconds);
  if (!result) return null;

  const jobStr = result.element || result[1] || result.value || result; // compatibility across clients
  try {
    return JSON.parse(jobStr);
  } catch (e) {
    console.error('Failed to parse job from queue', queueKey, e);
    return null;
  }
}

// Convenience wrappers
async function enqueueEmailJob(data) {
  return enqueue(EMAIL_QUEUE_KEY, data);
}

async function enqueueNotificationJob(data) {
  return enqueue(NOTIFICATION_QUEUE_KEY, data);
}

module.exports = {
  EMAIL_QUEUE_KEY,
  NOTIFICATION_QUEUE_KEY,
  enqueueEmailJob,
  enqueueNotificationJob,
  dequeue,
};
