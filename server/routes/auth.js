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
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
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

module.exports = router
