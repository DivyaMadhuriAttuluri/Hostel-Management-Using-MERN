import Redis from "ioredis";

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,       // never throw MaxRetriesPerRequestError
  enableOfflineQueue: true,          // queue commands while disconnected
  retryStrategy(times) {
    if (times > 5) {
      console.warn("⚠️ Redis unavailable — running without Redis (refresh tokens & OTP will not work)");
      return null; // stop retrying after 5 attempts
    }
    return Math.min(times * 500, 3000); // backoff: 500ms, 1s, 1.5s, 2s, 2.5s
  },
  lazyConnect: false,
});

let redisAvailable = false;

redis.on("connect", () => {
  redisAvailable = true;
  console.log("🧠 Redis connected");
});

redis.on("error", (err) => {
  if (redisAvailable) {
    redisAvailable = false;
    console.error("❌ Redis disconnected:", err.message);
  }
  // Suppress repeated error spam
});

redis.on("close", () => {
  redisAvailable = false;
});

export const isRedisAvailable = () => redisAvailable;
export default redis;
