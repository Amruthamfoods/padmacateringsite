/**
 * Winston Logger Configuration
 * Structured logging for production
 */

const winston = require('winston')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'padma-catering-server' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`
        )
      ),
    }),
    // Error logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
    }),
    // All logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
    }),
  ],
})

module.exports = logger
