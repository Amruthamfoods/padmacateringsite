const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { error: 'Too many authentication requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 booking requests per minute per IP
  message: { error: 'Too many booking requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { authLimiter, bookingLimiter }
