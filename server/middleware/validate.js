/**
 * Validation Middleware
 * Validates request body against joi schemas
 */

const schemas = require('../utils/validationSchemas')

function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName]
    if (!schema) {
      return res.status(500).json({ error: 'Validation schema not found' })
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Get all errors
      stripUnknown: true, // Remove unknown fields
      convert: true, // Attempt type conversions
    })

    if (error) {
      const messages = error.details.map(d => d.message)
      console.error('[Validation]', schemaName, messages)
      return res.status(400).json({
        error: 'Validation failed',
        details: messages,
      })
    }

    // Replace req.body with validated data
    req.body = value
    next()
  }
}

module.exports = validate
