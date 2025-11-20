const { createClient } = require("redis");

const clientOptions = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
};

const redisClient = createClient(clientOptions);

redisClient.on("error", (err) => {
  console.error("❌ Main Redis Error:", err);
});

const subscriberClient = redisClient.duplicate();

subscriberClient.on("error", (err) => {
  console.error("❌ Redis Subscriber Error:", err);
});

redisClient
  .connect()
  .then(() => console.log("✅ Main Redis Client Connected (for Caching/Publishing)"))
  .catch(console.error);

module.exports = {
  redisClient,
  subscriberClient,
};
