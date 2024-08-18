import rateLimit from "express-rate-limit";

// Create read and write rate limiters
const readRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 read requests per window
  message: "Too many read requests from this IP, please try again later.",
});

const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Max 50 write requests per window
  message: "Too many write requests from this IP, please try again later.",
});

export { readRateLimiter, writeRateLimiter };
