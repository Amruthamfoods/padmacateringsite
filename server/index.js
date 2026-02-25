require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const nodemailer = require('nodemailer')
const { PrismaClient } = require('@prisma/client')
const { authLimiter } = require('./middleware/rateLimiter')

const authRouter    = require('./routes/auth')
const menuRouter    = require('./routes/menu')
const bookingRouter = require('./routes/booking')
const couponRouter  = require('./routes/coupon')
const adminRouter   = require('./routes/admin')
const quoteRouter   = require('./routes/quote')

const app    = express()
const PORT   = process.env.PORT || 3001
const prisma = new PrismaClient()

app.use(cors({ origin: /http:\/\/localhost:\d+/ }))
app.use(express.json())

/* ─── Mount routers ─── */
app.use('/api/auth',    authLimiter, authRouter)
app.use('/api/menu',    menuRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/coupon',  couponRouter)
app.use('/api/admin',   adminRouter)
app.use('/api/quote',   quoteRouter)

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
  const { name, email, phone, subject, message } = req.body
  if (!name || !phone || !message) {
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
  try {
    await transporter.sendMail({
      from:    `"Padma Catering Website" <${process.env.GMAIL_USER}>`,
      to:      'amruthamfoodsvizag@gmail.com',
      replyTo: email || undefined,
      subject: `Enquiry: ${subject || 'General'} — ${name}`,
      html,
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Contact email error:', err.message)
    res.status(500).json({ error: 'Failed to send' })
  }
})

/* ─── Health check ─── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

/* ─── Start ─── */
async function start() {
  try {
    await prisma.$connect()
    console.log('Database connected')
  } catch (err) {
    console.warn('DB not available (run migrations first):', err.message)
  }
  app.listen(PORT, () => {
    console.log(`Padma Catering API running on http://localhost:${PORT}`)
  })
}

start()
