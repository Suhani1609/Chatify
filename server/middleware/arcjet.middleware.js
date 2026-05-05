import arcjet, { tokenBucket, shield, detectBot, fixedWindow } from "@arcjet/node";

export const authLimiter = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: [] }),
    fixedWindow({ mode: "LIVE", window: "10m", max: 10 }),
  ],
});

export const messageLimiter = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({ mode: "LIVE", refillRate: 100, interval: "1m", capacity: 100 }),
  ],
});

export const generalLimiter = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    fixedWindow({ mode: "LIVE", window: "1m", max: 60 }),
  ],
});

export const createArcjetMiddleware = (limiter) => {
  return async (req, res, next) => {
    try {
      const decision = await limiter.protect(req);
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ message: "Too many requests — slow down" });
        }
        if (decision.reason.isBot()) {
          return res.status(403).json({ message: "Bot traffic not allowed" });
        }
        return res.status(403).json({ message: "Request denied" });
      }
      next();
    } catch (error) {
      console.error("Arcjet error:", error.message);
      next();
    }
  };
};