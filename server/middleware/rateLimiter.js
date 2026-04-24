import rateLimit from "express-rate-limit";

// ─── Global rate limit ───────────────────────────────────────────────
// Applies to ALL routes. Generous limit to prevent abuse without
// blocking legitimate users.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// ─── Auth rate limit ─────────────────────────────────────────────────
// Strict limit for login / register / password-reset endpoints
// to prevent brute-force and credential-stuffing attacks.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// ─── Sensitive / OTP rate limit ──────────────────────────────────────
// Ultra-strict for forgot-password / OTP routes to prevent email abuse.
export const sensitiveRouteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests to this resource. Please try again after an hour.",
  },
});
