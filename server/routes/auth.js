const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')
const validate = require('../middleware/validate')
const logger = require('../utils/logger')

const prisma = new PrismaClient()

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// POST /api/auth/register
router.post('/register', validate('register'), async (req, res) => {
  try {
    const { name, email, phone, password } = req.body
    
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      logger.warn('Duplicate registration attempt', { email })
      return res.status(409).json({ error: 'Email already registered' })
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, phone: phone || null, passwordHash },
    })
    
    const token = signToken(user)
    logger.info('User registered', { userId: user.id, email })
    res.status(201).json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    })
  } catch (err) {
    logger.error('Registration error', { email: req.body.email, error: err.message })
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', validate('login'), async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      logger.warn('Login failed - user not found', { email })
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      logger.warn('Login failed - invalid password', { email })
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    
    const token = signToken(user)
    logger.info('User logged in', { userId: user.id, email })
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    })
  } catch (err) {
    logger.error('Login error', { email: req.body.email, error: err.message })
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me - Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, address: true, addressLat: true, addressLng: true, role: true, createdAt: true, points: true, referralCode: true, gstName: true, gstNumber: true },
    })
    if (!user) {
      logger.warn('User not found', { userId: req.user.id })
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    logger.error('Failed to fetch user', { userId: req.user.id, error: err.message })
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})


// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const rawPhone = (req.body.phone || '').replace(/\D/g, '').slice(-10)
    if (rawPhone.length !== 10) return res.status(400).json({ error: 'Enter a valid 10-digit phone number' })
    const mobile = '91' + rawPhone

    // Delete old OTPs for this phone
    await prisma.otpCode.deleteMany({ where: { phone: mobile } })

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await prisma.otpCode.create({ data: { phone: mobile, code, expiresAt } })

    // Check if user already exists (frontend uses this to know if name is needed)
    const user = await prisma.user.findFirst({ where: { phone: mobile } })

    // Send OTP via MSG91
    const https = require('https')
    const msg91Key = process.env.MSG91_AUTH_KEY
    const message = `Your OTP for Padma Catering is ${code}. Valid for 10 minutes. Do not share.`
    const smsUrl = `https://api.msg91.com/api/sendhttp.php?authkey=${msg91Key}&mobiles=${mobile}&message=${encodeURIComponent(message)}&route=4&country=91&sender=PADMAC`
    https.get(smsUrl, (smsRes) => {
      let data = ''
      smsRes.on('data', chunk => { data += chunk })
      smsRes.on('end', () => logger.info('MSG91 response', { data }))
    }).on('error', err => logger.warn('MSG91 send failed (DLT pending?)', { error: err.message }))

    logger.info('OTP generated for testing', { mobile, code })
    const isDev = process.env.NODE_ENV !== 'production'
    res.json({ isNew: !user, ...(isDev && { devOtp: code }) })
  } catch (err) {
    logger.error('send-otp error', { error: err.message })
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const rawPhone = (req.body.phone || '').replace(/\D/g, '').slice(-10)
    if (rawPhone.length !== 10) return res.status(400).json({ error: 'Invalid phone number' })
    const mobile = '91' + rawPhone
    const { otp, name } = req.body
    if (!otp) return res.status(400).json({ error: 'Enter the OTP' })

    // Find valid unused OTP
    const record = await prisma.otpCode.findFirst({
      where: { phone: mobile, used: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    if (!record || record.code !== String(otp)) {
      return res.status(401).json({ error: 'Invalid or expired OTP' })
    }

    // Mark OTP used
    await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } })

    // Find or create user by phone
    let user = await prisma.user.findFirst({ where: { phone: mobile } })
    if (!user) {
      const userName = (name || '').trim() || 'Customer'
      user = await prisma.user.create({
        data: {
          name: userName,
          email: `ph_${mobile}@padma.local`,
          phone: mobile,
          passwordHash: await bcrypt.hash(Math.random().toString(36) + Date.now(), 10),
        },
      })
    }

    const token = signToken(user)
    logger.info('OTP login success', { userId: user.id, mobile })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    logger.error('verify-otp error', { error: err.message })
    res.status(500).json({ error: 'OTP verification failed' })
  }
})


// PUT /api/auth/profile - Update name and phone
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, addressLat, addressLng } = req.body
    const data = {}
    if (name && name.trim()) data.name = name.trim()
    if (phone !== undefined) {
      const digits = (phone || '').replace(/\D/g, '').slice(-10)
      data.phone = digits.length === 10 ? '91' + digits : null
    }
    if (address !== undefined) data.address = address || null
    if (addressLat !== undefined) data.addressLat = addressLat ? parseFloat(addressLat) : null
    if (addressLng !== undefined) data.addressLng = addressLng ? parseFloat(addressLng) : null
    // If the phone belongs to a ghost phone-login account, release it first
    if (data.phone) {
      const existing = await prisma.user.findUnique({ where: { phone: data.phone } })
      if (existing && existing.id !== req.user.id && existing.email.endsWith('@padma.local')) {
        await prisma.user.update({ where: { id: existing.id }, data: { phone: null } })
      }
    }
    const user = await prisma.user.update({ where: { id: req.user.id }, data })
    logger.info('Profile updated', { userId: user.id })
    res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, gstName: user.gstName, gstNumber: user.gstNumber, points: user.points, referralCode: user.referralCode } })
  } catch (err) {
    logger.error('Profile update error', { error: err.message })
    if (err.code === 'P2002' && err.meta?.target?.includes('phone')) {
      return res.status(400).json({ error: 'This phone number is already linked to another account' })
    }
    res.status(500).json({ error: 'Failed to update profile' })
  }
})


// GET /api/auth/addresses
router.get('/addresses', authMiddleware, async (req, res) => {
  try {
    const addresses = await prisma.userAddress.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
    res.json(addresses)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses' })
  }
})

// POST /api/auth/addresses
router.post('/addresses', authMiddleware, async (req, res) => {
  try {
    const { label, address, lat, lng, isDefault } = req.body
    if (!address?.trim()) return res.status(400).json({ error: 'Address is required' })
    if (isDefault) {
      await prisma.userAddress.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
    }
    const addr = await prisma.userAddress.create({
      data: { userId: req.user.id, label: label?.trim() || null, address: address.trim(), lat: lat || null, lng: lng || null, isDefault: !!isDefault },
    })
    res.json(addr)
  } catch (err) {
    res.status(500).json({ error: 'Failed to save address' })
  }
})

// DELETE /api/auth/addresses/:id
router.delete('/addresses/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const addr = await prisma.userAddress.findUnique({ where: { id } })
    if (!addr || addr.userId !== req.user.id) return res.status(404).json({ error: 'Not found' })
    await prisma.userAddress.delete({ where: { id } })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address' })
  }
})

module.exports = router
