import rateLimit from 'express-rate-limit';

// Rate limiter middleware to prevent brute-force attacks
export const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});
