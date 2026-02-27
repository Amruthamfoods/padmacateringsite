const router = require('express').Router()
const nodemailer = require('nodemailer')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')
const validate = require('../middleware/validate')
const logger = require('../utils/logger')
const { sanitizeObject } = require('../utils/sanitizer')

const prisma = new PrismaClient()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
})

const STAFF_RATE = parseInt(process.env.STAFF_RATE_PER_PERSON || 650)
const GST_RATE = parseFloat(process.env.GST_RATE || 0.05)

// POST /api/booking - Create a new booking
router.post('/', validate('createBooking'), async (req, res) => {
  try {
    const {
      eventType, eventDate, guestCount, vegCount, nonVegCount,
      venueAddress, servingStyle,
      deliveryType, deliveryCharge, staffCount,
      addonCost, dietPreference, spiceLevel, timeSlot, paymentPlan,
      menuItemIds, specialInstructions, couponCode, couponId,
      guestName, guestEmail, guestPhone, packageId,
      pricePerPerson: explicitPricePerPerson,
    } = req.body

    // Fetch selected items
    const items = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds.map(Number), active: true },
      include: { category: true },
    })

    if (items.length !== menuItemIds.length) {
      logger.warn('Booking: Invalid menu items', { requested: menuItemIds.length, found: items.length })
      return res.status(400).json({ error: 'One or more menu items not found or inactive' })
    }

    // Calculate price server-side (no trust on client totalAmount)
    const pricePerPerson = explicitPricePerPerson || items.reduce((sum, item) => sum + item.price, 0)
    const baseTotal = pricePerPerson * guestCount
    const staffCharge = staffCount * STAFF_RATE
    const packingCost = Math.round(baseTotal * 0.10)
    const subtotal = baseTotal + packingCost + (addonCost || 0) + deliveryCharge + staffCharge

    // Handle coupon with atomic transaction to prevent race condition
    let discount = 0
    let resolvedCouponId = null

    if (couponCode || couponId) {
      try {
        const result = await prisma.$transaction(async (tx) => {
          const coupon = await tx.coupon.findUnique({ 
            where: { id: couponId || undefined, code: couponCode ? couponCode.toUpperCase() : undefined }
          })

          if (!coupon || !coupon.active) {
            return { valid: false, discount: 0, couponId: null }
          }

          if (coupon.expiryDate && new Date() > coupon.expiryDate) {
            return { valid: false, discount: 0, couponId: null }
          }

          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            logger.warn('Coupon usage limit exceeded', { couponId: coupon.id })
            return { valid: false, discount: 0, couponId: null }
          }

          let couponDiscount = 0
          if (coupon.discountType === 'FLAT') {
            couponDiscount = coupon.value
          } else {
            couponDiscount = (subtotal * coupon.value) / 100
          }

          // Increment coupon usage atomically
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          })

          return { 
            valid: true, 
            discount: couponDiscount, 
            couponId: coupon.id 
          }
        })

        if (result.valid) {
          discount = result.discount
          resolvedCouponId = result.couponId
        }
      } catch (err) {
        logger.error('Coupon processing error', { couponCode, couponId, error: err.message })
        // Continue without coupon on error
      }
    }

    const gst = Math.round((subtotal - discount) * GST_RATE)
    const total = subtotal - discount + gst

    // Razorpay stub
    const razorpayOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(total * 100),
      currency: 'INR',
    }

    // Get userId from token if available (optional auth)
    let userId = null
    const authHeader = req.headers['authorization']
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
        userId = decoded.id
      } catch (e) {
        logger.debug('JWT verification failed', { error: e.message })
      }
    }

    // Sanitize user inputs
    const sanitized = sanitizeObject({
      guestName,
      specialInstructions,
      venueAddress,
    }, ['guestName', 'specialInstructions', 'venueAddress'])

    // Save booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        packageId: packageId ? parseInt(packageId) : null,
        eventType,
        eventDate: new Date(eventDate),
        guestCount: parseInt(guestCount),
        vegCount: parseInt(vegCount) || 0,
        nonVegCount: parseInt(nonVegCount) || 0,
        venueAddress: sanitized.venueAddress,
        servingStyle: servingStyle || 'BUFFET',
        deliveryType: deliveryType || 'GATE',
        deliveryCharge: parseFloat(deliveryCharge) || 0,
        staffCount: parseInt(staffCount) || 0,
        staffCharge,
        addonCharge: parseFloat(addonCost) || 0,
        dietPreference: dietPreference || 'NON_VEG',
        spiceLevel: spiceLevel || 'MEDIUM',
        timeSlot: timeSlot || null,
        paymentPlan: paymentPlan || 'FULL',
        specialInstructions: sanitized.specialInstructions,
        guestName: sanitized.guestName,
        guestPhone: guestPhone || null,
        guestEmail: guestEmail || null,
        couponId: resolvedCouponId,
        baseTotal,
        discount,
        gst,
        total,
        razorpayOrderId: razorpayOrder.id,
        menuItems: {
          create: items.map(item => ({ menuItemId: item.id })),
        },
      },
    })

    // Send confirmation emails (non-blocking)
    const customerName = sanitized.guestName || 'Valued Customer'
    const customerEmail = guestEmail
    const menuList = items.map(i => `• ${i.name} (${i.category.name})`).join('<br/>')

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#8B0000;border-bottom:2px solid #D4AF37;padding-bottom:8px;">
          New Booking #${booking.id} — Padma Catering
        </h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;width:35%;">Customer</td><td style="padding:10px;">${customerName}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Phone</td><td style="padding:10px;">${guestPhone || 'N/A'}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Email</td><td style="padding:10px;">${customerEmail || 'N/A'}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Event Type</td><td style="padding:10px;">${eventType}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Event Date</td><td style="padding:10px;">${eventDate}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Guests</td><td style="padding:10px;">${guestCount}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Venue</td><td style="padding:10px;">${sanitized.venueAddress || 'TBD'}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Time Slot</td><td style="padding:10px;">${timeSlot || 'TBD'}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Delivery</td><td style="padding:10px;">${deliveryType || 'GATE'}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Diet Preference</td><td style="padding:10px;">${dietPreference || 'NON_VEG'}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Spice Level</td><td style="padding:10px;">${spiceLevel || 'MEDIUM'}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Payment Plan</td><td style="padding:10px;">${paymentPlan || 'FULL'}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Total</td><td style="padding:10px;">₹${total.toFixed(0)}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Menu Items</td><td style="padding:10px;">${menuList}</td></tr>
        </table>
      </div>`

    transporter.sendMail({
      from: `"Padma Catering Booking" <${process.env.GMAIL_USER}>`,
      to: 'amruthamfoodsvizag@gmail.com',
      subject: `New Booking #${booking.id}: ${eventType} — ${customerName} (${guestCount} guests)`,
      html: adminHtml,
    }).catch(e => logger.error('Admin email error', { error: e.message }))

    if (customerEmail) {
      transporter.sendMail({
        from: `"Padma Catering" <${process.env.GMAIL_USER}>`,
        to: customerEmail,
        subject: `Booking Confirmed #${booking.id} — Padma Catering`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#8B0000;">Thank you, ${customerName}! 🙏</h2>
            <p>Your booking <strong>#${booking.id}</strong> for <strong>${eventType}</strong> on <strong>${eventDate}</strong> for <strong>${guestCount} guests</strong> has been received.</p>
            <p>Our team will contact you within 24 hours to confirm the details.</p>
            <p style="font-size:13px;color:#666;">📞 +91 86 86 622 722 | +91 98 49 915 468</p>
          </div>`,
      }).catch(e => logger.error('Customer email error', { email: customerEmail, error: e.message }))
    }

    logger.info('Booking created successfully', { bookingId: booking.id, guestCount, eventType })
    res.status(201).json({ bookingId: booking.id, razorpayOrder, total: subtotal.toFixed(0) })
  } catch (err) {
    logger.error('Booking creation error', { error: err.message, stack: err.stack })
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

// GET /api/booking/my - List all bookings for current user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        menuItems: { include: { menuItem: { include: { category: true } } } },
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    logger.info('Bookings fetched', { userId: req.user.id, count: bookings.length })
    res.json(bookings)
  } catch (err) {
    logger.error('Failed to fetch bookings', { userId: req.user.id, error: err.message })
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// GET /api/booking/:id - Get single booking by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id)
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' })
    }
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        menuItems: { include: { menuItem: { include: { category: true } } } },
        coupon: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    })
    if (!booking) {
      logger.warn('Booking not found', { bookingId, userId: req.user.id })
      return res.status(404).json({ error: 'Booking not found' })
    }
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      logger.warn('Unauthorized booking access attempt', { bookingId, userId: req.user.id })
      return res.status(403).json({ error: 'Access denied' })
    }
    logger.info('Booking retrieved', { bookingId, userId: req.user.id })
    res.json(booking)
  } catch (err) {
    logger.error('Failed to fetch booking', { bookingId: req.params.id, error: err.message })
    res.status(500).json({ error: 'Failed to fetch booking' })
  }
})

// PATCH /api/booking/:id/cancel - Cancel a pending booking
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id)
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' })
    }
    
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      logger.warn('Cancel attempt on non-existent booking', { bookingId })
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    if (booking.userId !== req.user.id) {
      logger.warn('Unauthorized cancel attempt', { bookingId, userId: req.user.id })
      return res.status(403).json({ error: 'Access denied' })
    }
    
    if (booking.status !== 'PENDING') {
      logger.warn('Cancel attempt on non-pending booking', { bookingId, status: booking.status })
      return res.status(400).json({ error: `Only PENDING bookings can be cancelled (current: ${booking.status})` })
    }
    
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    })
    
    // If coupon was used, decrement usage count
    if (updated.couponId) {
      await prisma.coupon.update({
        where: { id: updated.couponId },
        data: { usedCount: { decrement: 1 } },
      })
    }
    
    logger.info('Booking cancelled', { bookingId, userId: req.user.id })
    res.json(updated)
  } catch (err) {
    logger.error('Failed to cancel booking', { bookingId: req.params.id, error: err.message })
    res.status(500).json({ error: 'Failed to cancel booking' })
  }
})

module.exports = router
