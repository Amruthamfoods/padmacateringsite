const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const validate = require('../middleware/validate')
const logger = require('../utils/logger')

const prisma = new PrismaClient()

// POST /api/coupon/validate - Validate and apply coupon
router.post('/validate', validate('validateCoupon'), async (req, res) => {
  try {
    const { code, orderValue } = req.body

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (!coupon || !coupon.active) {
      logger.warn('Invalid coupon attempted', { code })
      return res.json({ valid: false, message: 'Invalid or expired coupon' })
    }
    
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      logger.warn('Expired coupon attempted', { code, expiryDate: coupon.expiryDate })
      return res.json({ valid: false, message: 'Coupon has expired' })
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      logger.warn('Coupon usage limit exceeded', { code, usageLimit: coupon.usageLimit })
      return res.json({ valid: false, message: 'Coupon usage limit reached' })
    }
    
    if (orderValue && coupon.minOrderValue > orderValue) {
      return res.json({ 
        valid: false, 
        message: `Minimum order ₹${coupon.minOrderValue.toLocaleString('en-IN')} required` 
      })
    }

    let discount = 0
    if (coupon.discountType === 'FLAT') {
      discount = coupon.value
    } else {
      discount = ((orderValue || 0) * coupon.value) / 100
    }

    logger.info('Coupon validated successfully', { code, discount, orderValue })
    res.json({ 
      valid: true, 
      discount, 
      couponId: coupon.id, 
      message: `Coupon applied! ₹${Math.round(discount).toLocaleString('en-IN')} off` 
    })
  } catch (err) {
    logger.error('Coupon validation error', { error: err.message })
    res.status(500).json({ valid: false, message: 'Failed to validate coupon' })
  }
})

module.exports = router
