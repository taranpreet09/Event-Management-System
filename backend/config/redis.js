const { createClient } = require("redis");

const clientOptions = {
  url: "redis://localhost:6379"
};

// 1. Create the main client (for caching and PUBLISHING)
const redisClient = createClient(clientOptions);

redisClient.on("error", (err) => {
  console.error("❌ Main Redis Error:", err);
});

// 2. Create a dedicated client for SUBSCRIBING
const subscriberClient = redisClient.duplicate();

// 
// ⭐ YEH SABSE IMPORTANT HISSA HAI ⭐
//
// Yeh "safety net" subscriber ke crash ko pakadta hai.
// Aapki file mein yeh missing ya galat ho sakta hai.
//
subscriberClient.on("error", (err) => {
  console.error("❌ Redis Subscriber Error:", err);
});

// 3. Connect the MAIN client
redisClient.connect()
  .then(() => console.log("✅ Main Redis Client Connected (for Caching/Publishing)"))
  .catch(console.error);

// 4. Export BOTH clients
module.exports = {
  redisClient,
  subscriberClient
};