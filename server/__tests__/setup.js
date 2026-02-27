/**
 * Test Setup
 * Database and environment configuration for tests
 */

const path = require('path')

// Load env vars from .env.test
require('dotenv').config({ path: path.join(__dirname, '../../.env.test') })

// Set test environment
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_secret_key_at_least_32_chars_long_1234567890'
