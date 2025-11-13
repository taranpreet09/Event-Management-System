const { createClient } = require("redis");

const client = createClient({
  url: "redis://localhost:6379"
});

client.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

client.connect()
  .then(() => console.log("✅ Redis Connected"))
  .catch(console.error);

module.exports = client;
