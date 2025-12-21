const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("❌ Main Redis Error:", err);
});

const subscriberClient = redisClient.duplicate();

subscriberClient.on("error", (err) => {
  console.error("❌ Redis Subscriber Error:", err);
});

(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Main Redis Client Connected");
    }

    if (!subscriberClient.isOpen) {
      await subscriberClient.connect();
      console.log("✅ Redis Subscriber Client Connected");
    }
  } catch (err) {
    console.error("❌ Redis connection error:", err);
  }
})();

module.exports = {
  redisClient,
  subscriberClient,
};
