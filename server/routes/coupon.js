const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// POST /api/coupon/validate
router.post('/validate', async (req, res) => {
  try {
    const { code, orderValue } = req.body
    if (!code) return res.status(400).json({ valid: false, message: 'Coupon code required' })

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (!coupon || !coupon.active) {
      return res.json({ valid: false, message: 'Invalid or expired coupon' })
    }
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.json({ valid: false, message: 'Coupon has expired' })
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.json({ valid: false, message: 'Coupon usage limit reached' })
    }
    if (orderValue && coupon.minOrderValue > orderValue) {
      return res.json({ valid: false, message: `Minimum order ₹${coupon.minOrderValue} required` })
    }

    let discount = 0
    if (coupon.discountType === 'FLAT') {
      discount = coupon.value
    } else {
      discount = ((orderValue || 0) * coupon.value) / 100
    }

    res.json({ valid: true, discount, couponId: coupon.id, message: `Coupon applied! ₹${discount.toFixed(0)} off` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ valid: false, message: 'Failed to validate coupon' })
  }
})

module.exports = router
