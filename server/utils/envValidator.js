/**
 * Environment Variable Validation
 * Validates all required env vars on startup
 */

function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GMAIL_USER',
    'GMAIL_PASS',
    'PORT',
    'CORS_ORIGIN',
  ]

  const optional = [
    'JWT_EXPIRES_IN',
    'STAFF_RATE_PER_PERSON',
    'GST_RATE',
    'PACKING_CHARGE_PERCENT',
    'NODE_ENV',
  ]

  const missing = []

  // Check required variables
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    process.exit(1)
  }

  // Validate format
  if (!process.env.DATABASE_URL.includes('postgresql://')) {
    console.error('❌ DATABASE_URL must be a valid PostgreSQL connection string')
    process.exit(1)
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters')
    process.exit(1)
  }

  if (isNaN(parseInt(process.env.PORT))) {
    console.error('❌ PORT must be a valid number')
    process.exit(1)
  }

  console.log('✅ Environment variables validated')

  // Set defaults for optional
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
  process.env.STAFF_RATE_PER_PERSON = process.env.STAFF_RATE_PER_PERSON || '650'
  process.env.GST_RATE = process.env.GST_RATE || '0.05'
  process.env.PACKING_CHARGE_PERCENT = process.env.PACKING_CHARGE_PERCENT || '0.10'
  process.env.NODE_ENV = process.env.NODE_ENV || 'development'
}

module.exports = validateEnv
