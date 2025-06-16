import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "You have sent too many requests. Please try again later.",
  },
});

export default limiter;
