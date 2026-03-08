const router = require('express').Router()
const Razorpay = require('razorpay')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', notes = {} } = req.body
    if (!amount || amount < 100) return res.status(400).json({ error: 'Invalid amount' })

    const order = await razorpay.orders.create({
      amount: Math.round(amount), // in paise
      currency,
      notes,
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Razorpay create order error:', err.message)
    res.status(500).json({ error: 'Payment initiation failed' })
  }
})

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment parameters' })
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed - invalid signature' })
    }

    if (bookingId) {
      await prisma.booking.update({
        where: { id: Number(bookingId) },
        data: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'CONFIRMED',
        },
      })
    }

    res.json({ success: true, paymentId: razorpay_payment_id })
  } catch (err) {
    console.error('Payment verify error:', err.message)
    res.status(500).json({ error: 'Payment verification error' })
  }
})

module.exports = router
