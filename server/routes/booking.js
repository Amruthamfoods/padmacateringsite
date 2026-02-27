const router = require('express').Router()
const nodemailer = require('nodemailer')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
})

// POST /api/booking
router.post('/', async (req, res) => {
  try {
    const {
      eventType, eventDate, guestCount, vegCount, nonVegCount,
      venueAddress, servingStyle,
      deliveryType, deliveryCharge, staffCount,
      addonCost, dietPreference, spiceLevel, timeSlot, paymentPlan,
      menuItemIds, specialInstructions, couponCode, couponId,
      guestName, guestEmail, guestPhone, packageId,
      pricePerPerson: explicitPricePerPerson,
      totalAmount,
    } = req.body

    if (!eventType || !eventDate || !guestCount) {
      return res.status(400).json({ error: 'eventType, eventDate and guestCount are required' })
    }
    if (!menuItemIds || menuItemIds.length < 1) {
      return res.status(400).json({ error: 'Please select at least one menu item' })
    }
    if (guestCount < 10) {
      return res.status(400).json({ error: 'Minimum 10 guests required' })
    }

    // Fetch selected items
    const items = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds.map(Number) }, active: true },
      include: { category: true },
    })

    // If explicit pricePerPerson provided (preset tier flow), use it; otherwise sum item prices
    const pricePerPerson = explicitPricePerPerson
      ? parseFloat(explicitPricePerPerson)
      : items.reduce((sum, item) => sum + item.price, 0)
    const baseTotal = pricePerPerson * guestCount

    // Apply coupon
    let discount = 0
    let resolvedCouponId = null
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (coupon && coupon.active && (!coupon.expiryDate || new Date() <= coupon.expiryDate)) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          discount = coupon.discountType === 'FLAT'
            ? coupon.value
            : (baseTotal * coupon.value) / 100
          resolvedCouponId = coupon.id
        }
      }
    } else if (couponId) {
      resolvedCouponId = couponId
    }

    const gst = (baseTotal - discount) * 0.05
    const total = baseTotal - discount + gst

    // Razorpay stub
    const razorpayOrder = {
      id: `order_${Date.now()}`,
      amount: Math.round(total * 100),
      currency: 'INR',
    }

    // Get userId from token if available (optional auth)
    const authHeader = req.headers['authorization']
    let userId = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
        userId = decoded.id
      } catch {}
    }

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
        venueAddress: venueAddress || null,
        servingStyle: servingStyle || 'BUFFET',
        deliveryType: deliveryType || 'GATE',
        deliveryCharge: parseFloat(deliveryCharge) || 0,
        staffCount: parseInt(staffCount) || 0,
        staffCharge: (parseInt(staffCount) || 0) * 650,
        addonCharge: parseFloat(addonCost) || 0,
        dietPreference: dietPreference || 'NON_VEG',
        spiceLevel: spiceLevel || 'MEDIUM',
        timeSlot: timeSlot || null,
        paymentPlan: paymentPlan || 'FULL',
        specialInstructions: specialInstructions || null,
        guestName: guestName || null,
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

    // Increment coupon usage
    if (resolvedCouponId) {
      await prisma.coupon.update({
        where: { id: resolvedCouponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    // Send confirmation emails (non-blocking)
    const customerName = guestName || 'Customer'
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
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Venue</td><td style="padding:10px;">${venueAddress || 'TBD'}</td></tr>
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
    }).catch(e => console.error('Admin email error:', e.message))

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
      }).catch(e => console.error('Customer email error:', e.message))
    }

    res.status(201).json({ bookingId: booking.id, razorpayOrder, total: total.toFixed(0) })
  } catch (err) {
    console.error('Booking error:', err)
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

// GET /api/booking/my
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
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// GET /api/booking/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        menuItems: { include: { menuItem: { include: { category: true } } } },
        coupon: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' })
    }
    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking' })
  }
})

// PATCH /api/booking/:id/cancel
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    if (booking.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' })
    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only PENDING bookings can be cancelled' })
    }
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' })
  }
})

module.exports = router
