/**
 * Input Sanitization Utility
 * Prevents XSS attacks by sanitizing user inputs
 */

const xss = require('xss')

// Whitelist allowed HTML tags for rich text fields
const allowedTags = []
const allowedAttrs = []

/**
 * Sanitize a single string
 */
function sanitizeString(input) {
  if (!input || typeof input !== 'string') return input
  return xss(input.trim(), {
    whiteList: allowedTags,
    stripIgnoredTag: true,
    stripLeakage: true,
  })
}

/**
 * Sanitize an entire object recursively
 */
function sanitizeObject(obj, fieldsToSanitize = null) {
  if (!obj || typeof obj !== 'object') return obj

  const sanitized = { ...obj }

  // If specific fields specified, sanitize only those
  if (fieldsToSanitize && Array.isArray(fieldsToSanitize)) {
    fieldsToSanitize.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = sanitizeString(sanitized[field])
      }
    })
    return sanitized
  }

  // Otherwise sanitize all string fields
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key])
    }
  })

  return sanitized
}

module.exports = {
  sanitizeString,
  sanitizeObject,
}
