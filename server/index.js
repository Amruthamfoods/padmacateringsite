require('dotenv').config()
const express       = require('express')
const cookieParser  = require('cookie-parser')
const csrf          = require('csurf')
const cors          = require('cors')
const path          = require('path')
const nodemailer    = require('nodemailer')
const { PrismaClient } = require('@prisma/client')

// Security & utilities
const validateEnv        = require('./utils/envValidator')
const logger             = require('./utils/logger')
const { authLimiter, bookingLimiter } = require('./middleware/rateLimiter')

// Routes
const authRouter    = require('./routes/auth')
const menuRouter    = require('./routes/menu')
const bookingRouter = require('./routes/booking')
const couponRouter  = require('./routes/coupon')
const adminRouter   = require('./routes/admin')
const quoteRouter   = require('./routes/quote')

// Validate environment on startup
validateEnv()

const app    = express()
const PORT   = process.env.PORT || 3001
const prisma = new PrismaClient()

// CORS configuration
app.use(cors({ 
  origin: process.env.CORS_ORIGIN ? new RegExp(process.env.CORS_ORIGIN) : /http:\/\/localhost:\d+/,
  credentials: true,
}))

// Body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

// CSRF protection (only for non-GET, non-API routes for now)
const csrfProtection = csrf({ cookie: false })

/* ─── Mount routers ─── */
app.use('/api/auth',    authLimiter, authRouter)
app.use('/api/menu',    menuRouter)
app.use('/api/booking', bookingLimiter, bookingRouter)
app.use('/api/coupon',  couponRouter)
app.use('/api/admin',   adminRouter)
app.use('/api/quote',   quoteRouter)

/* ─── Serve booking portal static files at /booking ─── */
const bookingDist = path.join(__dirname, '../booking-portal/dist')
app.use('/booking', express.static(bookingDist))
app.get('/booking/*', (_req, res) => {
  res.sendFile(path.join(bookingDist, 'index.html'))
})

/* ─── Nodemailer transport (kept for /api/contact) ─── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

/* ─── POST /api/contact ─── */
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body
    if (!name || !phone || !message) {
      logger.warn('Contact form: Missing required fields', { name, email, phone })
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px;">
      <h2 style="color:#F5A623;border-bottom:2px solid #F5A623;padding-bottom:8px;">
        📩 New Contact Enquiry — Padma Catering
      </h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;width:30%;">Name</td><td style="padding:10px 14px;">${name}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:bold;">Phone</td><td style="padding:10px 14px;">${phone}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;">Email</td><td style="padding:10px 14px;">${email || 'Not provided'}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:bold;">Subject</td><td style="padding:10px 14px;">${subject}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;">Message</td><td style="padding:10px 14px;">${message}</td></tr>
      </table>
    </div>
  `
    await transporter.sendMail({
      from:    `"Padma Catering Website" <${process.env.GMAIL_USER}>`,
      to:      'amruthamfoodsvizag@gmail.com',
      replyTo: email || undefined,
      subject: `Enquiry: ${subject || 'General'} — ${name}`,
      html,
    })
    logger.info('Contact form submitted', { name, phone, email })
    res.json({ success: true })
  } catch (err) {
    logger.error('Contact email error', { error: err.message, stack: err.stack })
    res.status(500).json({ error: 'Failed to send' })
  }
})

/* ─── POST /api/consultation ─── */
app.post('/api/consultation', async (req, res) => {
  try {
    const { name, phone, email, eventType, eventDate, guestCount, venue, city, servingStyle, budget, preferences, specialRequirements } = req.body
    if (!name || !phone || !eventType || !eventDate || !guestCount) {
      logger.warn('Consultation: Missing required fields', { name, phone, eventType })
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px;">
      <h2 style="color:#D4AF37;border-bottom:2px solid #D4AF37;padding-bottom:8px;">
        ✨ New Event Consultation Request — Amrutham by Padma Catering
      </h2>
      <h3 style="color:#555;margin-top:20px;">Contact Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;width:35%;">Name</td><td style="padding:10px 14px;">${name}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:bold;">Phone</td><td style="padding:10px 14px;">${phone}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;">Email</td><td style="padding:10px 14px;">${email || 'Not provided'}</td></tr>
      </table>
      <h3 style="color:#555;margin-top:20px;">Event Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;width:35%;">Event Type</td><td style="padding:10px 14px;">${eventType}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:bold;">Event Date</td><td style="padding:10px 14px;">${eventDate}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;">Expected Guests</td><td style="padding:10px 14px;">${guestCount}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:bold;">Serving Style</td><td style="padding:10px 14px;">${servingStyle || 'Not specified'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;">Venue</td><td style="padding:10px 14px;">${venue || 'Not specified'}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:bold;">City</td><td style="padding:10px 14px;">${city || 'Not specified'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;">Budget Range</td><td style="padding:10px 14px;">${budget || 'Not specified'}</td></tr>
      </table>
      <h3 style="color:#555;margin-top:20px;">Preferences & Requirements</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="background:#f9f9f9;"><td style="padding:10px 14px;font-weight:bold;width:35%;vertical-align:top;">Cuisine Preferences</td><td style="padding:10px 14px;">${preferences || 'Not specified'}</td></tr>
        <tr><td style="padding:10px 14px;font-weight:bold;vertical-align:top;">Special Requirements</td><td style="padding:10px 14px;">${specialRequirements || 'None'}</td></tr>
      </table>
    </div>
  `
    await transporter.sendMail({
      from:    `"Padma Catering Website" <${process.env.GMAIL_USER}>`,
      to:      'amruthamfoodsvizag@gmail.com',
      replyTo: email || undefined,
      subject: `Consultation Request: ${eventType} — ${name} (${guestCount} guests)`,
      html,
    })
    logger.info('Consultation request submitted', { name, phone, eventType, guestCount })
    res.json({ success: true })
  } catch (err) {
    logger.error('Consultation email error', { error: err.message, stack: err.stack })
    res.status(500).json({ error: 'Failed to send' })
  }
})

/* ─── Error handling middleware ─── */
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    message: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
  })
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  })
})

/* ─── Health check ─── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

/* ─── Serve main site static files (catch-all — must be last) ─── */
const mainDist = path.join(__dirname, '../main-site/dist')
app.use(express.static(mainDist))
app.get('*', (_req, res) => {
  res.sendFile(path.join(mainDist, 'index.html'))
})

/* ─── Start ─── */
async function start() {
  try {
    await prisma.$connect()
    logger.info('Database connected')
  } catch (err) {
    logger.warn('DB not available (run migrations first)', { error: err.message })
  }
  app.listen(PORT, () => {
    logger.info(`Padma Catering API running`, { port: PORT, env: process.env.NODE_ENV })
  })
}

start()
