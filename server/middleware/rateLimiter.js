const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window (login/register/OTP attempts)
  message: { error: 'Too many authentication requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Looser limiter for read-only auth endpoints like /me and /profile
const authReadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute (page loads, refreshes)
  message: { error: 'Too many requests, please try again later' },
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

module.exports = { authLimiter, authReadLimiter, bookingLimiter }
