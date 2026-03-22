const router = require('express').Router()
const multer = require('multer')
const { PrismaClient } = require('@prisma/client')
const xlsx = require('xlsx')
const nodemailer = require('nodemailer')
const authMiddleware = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
})

function bookingDetailsHtml(b) {
  const date = new Date(b.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const menuRows = (b.menuItems || []).map(mi =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${mi.menuItem?.name || '—'}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${(mi.menuItem?.price || 0).toFixed(2)}</td></tr>`
  ).join('')

  const rows = [
    ['Event Type', b.eventType],
    ['Event Date', date],
    ['Time Slot', b.timeSlot || '—'],
    ['Guests', b.guestCount],
    ['Venue', b.venueAddress || '—'],
    ['Serving Style', b.servingStyle],
    ['Diet Preference', b.dietPreference],
    ['Spice Level', b.spiceLevel],
    ['Payment Plan', b.paymentPlan],
  ].map(([k, v]) =>
    `<tr><td style="padding:8px 12px;font-weight:600;color:#555;border-bottom:1px solid #f0f0f0;width:40%;">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${v}</td></tr>`
  ).join('')

  const pricingRows = [
    ['Base Total', b.baseTotal],
    b.deliveryCharge > 0 ? ['Delivery Charge', b.deliveryCharge] : null,
    b.staffCharge > 0 ? ['Staff Charge', b.staffCharge] : null,
    b.addonCharge > 0 ? ['Add-on Charge', b.addonCharge] : null,
    b.discount > 0 ? ['Discount', -b.discount] : null,
    b.gst > 0 ? ['GST', b.gst] : null,
    b.coinsRedeemed > 0 ? [`Coins Redeemed (${b.coinsRedeemed} pts)`, -b.cashback] : null,
  ].filter(Boolean).map(([k, v]) =>
    `<tr><td style="padding:6px 12px;color:#555;">${k}</td><td style="padding:6px 12px;text-align:right;">${v < 0 ? '-' : ''}₹${Math.abs(v).toFixed(2)}</td></tr>`
  ).join('')

  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:0;background:#fff;">
      <div style="background:#8B0000;padding:24px 28px;">
        <h1 style="margin:0;color:#fff;font-size:22px;">Padma Catering</h1>
        <p style="margin:4px 0 0;color:#ffcccc;font-size:13px;">Visakhapatnam</p>
      </div>
      <div style="padding:24px 28px;">
        <p style="margin:0 0 16px;font-size:15px;color:#333;">Hi <strong>${b.guestName}</strong>,</p>

        <h3 style="margin:0 0 12px;color:#333;font-size:15px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">Booking Details — #${b.id}</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">${rows}</table>

        ${menuRows ? `
        <h3 style="margin:0 0 12px;color:#333;font-size:15px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">Menu Items</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
          <thead><tr style="background:#f9f9f9;"><th style="padding:8px 12px;text-align:left;">Item</th><th style="padding:8px 12px;text-align:right;">Price/plate</th></tr></thead>
          <tbody>${menuRows}</tbody>
        </table>` : ''}

        <h3 style="margin:0 0 12px;color:#333;font-size:15px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">Pricing Summary</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
          ${pricingRows}
          <tr style="background:#8B0000;color:#fff;font-weight:bold;">
            <td style="padding:10px 12px;">Total</td>
            <td style="padding:10px 12px;text-align:right;">₹${b.total.toFixed(2)}</td>
          </tr>
        </table>

        <p style="font-size:13px;color:#666;margin-top:24px;">For any queries:<br>📞 +91 86 86 622 722 &nbsp;|&nbsp; +91 98 49 915 468</p>
        <p style="font-size:12px;color:#999;margin-top:8px;">— Padma Catering Team, Visakhapatnam</p>
      </div>
    </div>`
}

const STATUS_EMAIL = {
  CONFIRMED: {
    subject: (b) => `Booking #${b.id} Confirmed ✅ — Padma Catering`,
    html: (b) => `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;">
        <div style="background:#2e7d32;padding:16px 28px;">
          <h2 style="margin:0;color:#fff;font-size:18px;">Your Booking is Confirmed! ✅</h2>
        </div>
        ${bookingDetailsHtml(b)}
      </div>`,
  },
  CANCELLED: {
    subject: (b) => `Booking #${b.id} Cancelled — Padma Catering`,
    html: (b) => `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;">
        <div style="background:#c62828;padding:16px 28px;">
          <h2 style="margin:0;color:#fff;font-size:18px;">Booking Cancelled</h2>
        </div>
        <div style="padding:24px 28px;font-family:Arial,sans-serif;font-size:14px;color:#333;">
          <p>Hi <strong>${b.guestName}</strong>,</p>
          <p>We regret to inform you that your booking <strong>#${b.id}</strong> for <strong>${b.eventType}</strong> on <strong>${new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> for <strong>${b.guestCount} guests</strong> has been <strong>cancelled</strong>.</p>
          <p>If this was unexpected or you have any questions, please reach out to us.</p>
          <p style="font-size:13px;color:#666;">📞 +91 86 86 622 722 | +91 98 49 915 468</p>
          <p style="font-size:12px;color:#999;">— Padma Catering Team, Visakhapatnam</p>
        </div>
      </div>`,
  },
  COMPLETED: {
    subject: (b) => `Thank You for Choosing Padma Catering — Booking #${b.id} 🙏`,
    html: (b) => `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;">
        <div style="background:#f57c00;padding:16px 28px;">
          <h2 style="margin:0;color:#fff;font-size:18px;">Thank You! 🙏</h2>
        </div>
        <div style="padding:24px 28px;font-family:Arial,sans-serif;font-size:14px;color:#333;">
          <p>Hi <strong>${b.guestName}</strong>,</p>
          <p>We hope your event was a wonderful success! Your booking <strong>#${b.id}</strong> for <strong>${b.eventType}</strong> has been marked as <strong>completed</strong>.</p>
          <p>We'd love to hear your feedback — it helps us serve you better.</p>
          <p style="font-size:13px;color:#666;">📞 +91 86 86 622 722 | +91 98 49 915 468</p>
          <p style="font-size:12px;color:#999;">— Padma Catering Team, Visakhapatnam</p>
        </div>
      </div>`,
  },
}
const upload = multer({ storage: multer.memoryStorage() })

// Disk storage for package images
const pkgImgStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../uploads/packages')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `pkg-${req.params.id}-${Date.now()}${ext}`)
  },
})
const uploadPkgImage = multer({ storage: pkgImgStorage, limits: { fileSize: 5 * 1024 * 1024 } })

// All admin routes require auth + admin role
router.use(authMiddleware, adminOnly)

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [todayB, weekB, monthB, totalB] = await Promise.all([
      prisma.booking.aggregate({ where: { createdAt: { gte: todayStart }, status: { not: 'CANCELLED' } }, _count: true, _sum: { total: true } }),
      prisma.booking.aggregate({ where: { createdAt: { gte: weekStart }, status: { not: 'CANCELLED' } }, _count: true, _sum: { total: true } }),
      prisma.booking.aggregate({ where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } }, _count: true, _sum: { total: true } }),
      prisma.booking.aggregate({ where: { status: { not: 'CANCELLED' } }, _count: true, _sum: { total: true } }),
    ])

    res.json({
      today: { bookings: todayB._count, revenue: todayB._sum.total || 0 },
      week: { bookings: weekB._count, revenue: weekB._sum.total || 0 },
      month: { bookings: monthB._count, revenue: monthB._sum.total || 0 },
      total: { bookings: totalB._count, revenue: totalB._sum.total || 0 },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, from, to, eventType, page = 1, limit = 20 } = req.query
    const where = {}
    if (status) where.status = status
    const baseWhere = {}
    if (eventType) baseWhere.eventType = eventType
    if (from || to) {
      baseWhere.eventDate = {}
      if (from) baseWhere.eventDate.gte = new Date(from)
      if (to) baseWhere.eventDate.lte = new Date(to)
    }
    const finalWhere = { ...baseWhere, ...where }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [bookings, count, statusCountsGroup] = await Promise.all([
      prisma.booking.findMany({
        where: finalWhere,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          menuItems: { include: { menuItem: { select: { name: true } } } },
          coupon: { select: { code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where: finalWhere }),
      prisma.booking.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { status: true }
      })
    ])

    const statusCounts = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 }
    statusCountsGroup.forEach(g => { statusCounts[g.status] = g._count.status })
    statusCounts.ALL = Object.values(statusCounts).reduce((a, b) => a + b, 0)

    res.json({ bookings, total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)), statusCounts })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// PATCH /api/admin/bookings/:id
router.patch('/bookings/:id', async (req, res) => {
  try {
    const { status, adminNotes, razorpayPaymentId } = req.body
    const data = {}
    if (status) data.status = status
    if (adminNotes !== undefined) data.adminNotes = adminNotes
    if (razorpayPaymentId) data.razorpayPaymentId = razorpayPaymentId
    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: {
        menuItems: { include: { menuItem: { select: { name: true, price: true } } } },
        coupon: { select: { code: true } },
      },
    })
    res.json(booking)

    // Send status-change email (fire and forget)
    if (status && STATUS_EMAIL[status] && booking.guestEmail) {
      const tpl = STATUS_EMAIL[status]
      transporter.sendMail({
        from: `"Padma Catering" <${process.env.GMAIL_USER}>`,
        to: booking.guestEmail,
        subject: tpl.subject(booking),
        html: tpl.html(booking),
      }).catch(e => console.error('Status email error:', e.message))
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking' })
  }
})

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true, name: true, email: true, phone: true, createdAt: true,
        bookings: { select: { id: true, status: true, total: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' })
  }
})

// POST /api/admin/customers/manual-booking
router.post('/customers/manual-booking', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, eventType, eventDate, guestCount, venueAddress, servingStyle, notes } = req.body
    if (!eventType || !eventDate || !guestCount) {
      return res.status(400).json({ error: 'eventType, eventDate, guestCount required' })
    }
    const booking = await prisma.booking.create({
      data: {
        eventType, eventDate: new Date(eventDate),
        guestCount: parseInt(guestCount),
        venueAddress: venueAddress || null,
        servingStyle: servingStyle || 'BUFFET',
        specialInstructions: notes || `Customer: ${customerName}, Phone: ${customerPhone}, Email: ${customerEmail}`,
        status: 'CONFIRMED',
      },
    })
    res.status(201).json(booking)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create manual booking' })
  }
})

// Blocked dates
router.get('/blocked-dates', async (req, res) => {
  try {
    const dates = await prisma.blockedDate.findMany({ orderBy: { date: 'asc' } })
    res.json(dates)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blocked dates' })
  }
})

router.post('/blocked-dates', async (req, res) => {
  try {
    const { date, reason, blockedSlots } = req.body
    const blocked = await prisma.blockedDate.create({
      data: {
        date: new Date(date),
        reason: reason || null,
        blockedSlots: Array.isArray(blockedSlots) ? blockedSlots : []
      }
    })
    res.status(201).json(blocked)
  } catch (err) {
    res.status(500).json({ error: 'Failed to block date' })
  }
})

router.delete('/blocked-dates/:id', async (req, res) => {
  try {
    await prisma.blockedDate.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blocked date' })
  }
})

// Coupons
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { id: 'desc' } })
    res.json(coupons)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons' })
  }
})

router.post('/coupons', async (req, res) => {
  try {
    const { code, discountType, value, minOrderValue, expiryDate, usageLimit, active } = req.body
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(), discountType: discountType || 'FLAT',
        value: parseFloat(value), minOrderValue: parseFloat(minOrderValue || 0),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        active: active !== false,
      },
    })
    res.status(201).json(coupon)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create coupon' })
  }
})

router.put('/coupons/:id', async (req, res) => {
  try {
    const { code, discountType, value, minOrderValue, expiryDate, usageLimit, active } = req.body
    const data = {}
    if (code) data.code = code.toUpperCase()
    if (discountType) data.discountType = discountType
    if (value !== undefined) data.value = parseFloat(value)
    if (minOrderValue !== undefined) data.minOrderValue = parseFloat(minOrderValue)
    if (expiryDate !== undefined) data.expiryDate = expiryDate ? new Date(expiryDate) : null
    if (usageLimit !== undefined) data.usageLimit = usageLimit ? parseInt(usageLimit) : null
    if (active !== undefined) data.active = active
    const coupon = await prisma.coupon.update({ where: { id: parseInt(req.params.id) }, data })
    res.json(coupon)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update coupon' })
  }
})

router.delete('/coupons/:id', async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete coupon' })
  }
})

// Menu - Categories
router.get('/menu/categories', async (req, res) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } },
    })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories for admin' })
  }
})

router.post('/menu/categories', async (req, res) => {
  try {
    const { name, sortOrder, active } = req.body
    const category = await prisma.menuCategory.create({
      data: {
        name,
        sortOrder: parseInt(sortOrder || 0),
        active: active !== false,
      },
    })
    res.status(201).json(category)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' })
  }
})

router.put('/menu/categories/:id', async (req, res) => {
  try {
    const { name, sortOrder, active } = req.body
    const data = {}
    if (name) data.name = name
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder)
    if (active !== undefined) data.active = active
    const category = await prisma.menuCategory.update({
      where: { id: parseInt(req.params.id) },
      data,
    })
    res.json(category)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' })
  }
})

router.delete('/menu/categories/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)

    // Ensure we don't delete if it's the only category, or just create "Uncategorized"
    let fallbackCategory = await prisma.menuCategory.findFirst({
      where: { name: 'Uncategorized' },
    })

    if (!fallbackCategory) {
      fallbackCategory = await prisma.menuCategory.create({
        data: { name: 'Uncategorized', sortOrder: 999, active: false },
      })
    }

    // If the category being deleted IS the Uncategorized bin, prevent deletion unless empty
    if (categoryId === fallbackCategory.id) {
      const count = await prisma.menuItem.count({ where: { categoryId } })
      if (count > 0) return res.status(400).json({ error: 'Cannot delete Uncategorized bin while it contains items.' })
    }

    // Move all items to Uncategorized
    if (categoryId !== fallbackCategory.id) {
      await prisma.menuItem.updateMany({
        where: { categoryId },
        data: { categoryId: fallbackCategory.id },
      })

      // Also update package rules
      await prisma.packageCategoryRule.updateMany({
        where: { categoryId },
        data: { categoryId: fallbackCategory.id },
      })
    }

    await prisma.menuCategory.delete({ where: { id: categoryId } })
    res.json({ success: true, fallbackCategoryId: fallbackCategory.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

// Menu - Items
router.get('/menu/items', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' })
  }
})

router.post('/menu/items', async (req, res) => {
  try {
    const { name, description, image, categoryId, style, type, active, price, servingSize, servingUnit } = req.body
    const item = await prisma.menuItem.create({
      data: {
        name, description: description || null, image: image || null,
        categoryId: parseInt(categoryId), style: style || 'ANDHRA',
        type: type || 'VEG', active: active !== false, price: parseFloat(price || 0),
        servingSize: servingSize ? parseFloat(servingSize) : null,
        servingUnit: servingUnit || null,
      },
      include: { category: true },
    })
    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item' })
  }
})

router.put('/menu/items/:id', async (req, res) => {
  try {
    const { name, description, image, categoryId, style, type, active, price, servingSize, servingUnit } = req.body
    const data = {}
    if (name) data.name = name
    if (description !== undefined) data.description = description
    if (image !== undefined) data.image = image
    if (categoryId) data.categoryId = parseInt(categoryId)
    if (style) data.style = style
    if (type) data.type = type
    if (active !== undefined) data.active = active
    if (price !== undefined) data.price = parseFloat(price)
    if (servingSize !== undefined) data.servingSize = servingSize ? parseFloat(servingSize) : null
    if (servingUnit !== undefined) data.servingUnit = servingUnit || null
    const item = await prisma.menuItem.update({ where: { id: parseInt(req.params.id) }, data, include: { category: true } })
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' })
  }
})

router.delete('/menu/items/:id', async (req, res) => {
  try {
    await prisma.menuItem.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

// Menu - Packages
router.get('/menu/packages', async (req, res) => {
  try {
    const packages = await prisma.menuPackage.findMany({
      include: {
        items: { include: { menuItem: { include: { category: true } } } },
        pricingTiers: { orderBy: { minGuests: 'asc' } },
        categoryRules: {
          include: {
            category: true,
            allowedItems: { include: { menuItem: { include: { category: true } } } },
          },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { basePrice: 'asc' },
    })
    res.json(packages)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' })
  }
})

router.post('/menu/packages', async (req, res) => {
  try {
    const { name, eventType, serviceType, style, type, servesMin, description, basePrice, mealTypes, itemIds } = req.body
    const pkg = await prisma.menuPackage.create({
      data: {
        name, eventType: eventType || null, serviceType: serviceType || null, style: style || 'ANDHRA', type: type || 'VEG',
        servesMin: parseInt(servesMin || 50), description: description || null,
        basePrice: parseFloat(basePrice || 0),
        mealTypes: Array.isArray(mealTypes) ? mealTypes : ["Breakfast", "Lunch", "Snacks", "Dinner"],
        items: itemIds ? { create: itemIds.map(id => ({ menuItemId: parseInt(id) })) } : undefined,
      },
      include: { items: { include: { menuItem: true } } },
    })
    res.status(201).json(pkg)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create package' })
  }
})

router.put('/menu/packages/:id', async (req, res) => {
  try {
    const { name, eventType, serviceType, style, type, servesMin, description, basePrice, mealTypes } = req.body
    const data = {}
    if (name) data.name = name
    if (eventType !== undefined) data.eventType = eventType
    if (serviceType !== undefined) data.serviceType = serviceType
    if (style) data.style = style
    if (type) data.type = type
    if (servesMin) data.servesMin = parseInt(servesMin)
    if (description !== undefined) data.description = description
    if (basePrice !== undefined) data.basePrice = parseFloat(basePrice)
    if (mealTypes !== undefined && Array.isArray(mealTypes)) data.mealTypes = mealTypes
    if (image !== undefined) data.image = image
    const pkg = await prisma.menuPackage.update({
      where: { id: parseInt(req.params.id) }, data,
      include: { items: { include: { menuItem: true } } },
    })
    res.json(pkg)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update package' })
  }
})

// POST /api/admin/menu/packages/:id/image — upload image file
router.post('/menu/packages/:id/image', uploadPkgImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const imageUrl = `/api/uploads/packages/${req.file.filename}`
    const pkg = await prisma.menuPackage.update({
      where: { id: parseInt(req.params.id) },
      data: { image: imageUrl },
    })
    res.json({ image: pkg.image })
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

router.delete('/menu/packages/:id', async (req, res) => {
  try {
    await prisma.menuPackageItem.deleteMany({ where: { packageId: parseInt(req.params.id) } })
    await prisma.menuPackage.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete package' })
  }
})


// Package Items management (replace all items with quantity/price)
router.put('/packages/:id/items', async (req, res) => {
  try {
    const pkgId = parseInt(req.params.id)
    const { items } = req.body  // [{ menuItemId, quantityPerPerson, pricePerUnit }]
    await prisma.menuPackageItem.deleteMany({ where: { packageId: pkgId } })
    if (items && items.length) {
      await prisma.menuPackageItem.createMany({
        data: items.map(i => ({
          packageId:         pkgId,
          menuItemId:        parseInt(i.menuItemId),
          quantityPerPerson: i.quantityPerPerson ? parseFloat(i.quantityPerPerson) : null,
          pricePerUnit:      i.pricePerUnit      ? parseFloat(i.pricePerUnit)      : null,
        })),
      })
    }
    const pkg = await prisma.menuPackage.findUnique({
      where: { id: pkgId },
      include: { items: { include: { menuItem: { include: { category: true } } } } },
    })
    res.json(pkg)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update package items' })
  }
})

// Package Pricing Tiers — bulk replace
router.put('/packages/:id/tiers/bulk', async (req, res) => {
  try {
    const pkgId = parseInt(req.params.id)
    const { tiers } = req.body // [{ minGuests, maxGuests, pricePerPerson }]
    await prisma.packagePricingTier.deleteMany({ where: { packageId: pkgId } })
    const created = await prisma.packagePricingTier.createMany({
      data: (tiers || []).map(t => ({
        packageId: pkgId,
        minGuests: parseInt(t.minGuests) || 0,
        maxGuests: t.maxGuests ? parseInt(t.maxGuests) : null,
        pricePerPerson: parseFloat(t.pricePerPerson) || 0,
      }))
    })
    res.json({ success: true, count: created.count })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save tiers' })
  }
})

// Package Pricing Tiers — individual CRUD
router.post('/packages/:id/tiers', async (req, res) => {
  try {
    const { minGuests, maxGuests, pricePerPerson } = req.body
    const tier = await prisma.packagePricingTier.create({
      data: {
        packageId: parseInt(req.params.id),
        minGuests: parseInt(minGuests),
        maxGuests: maxGuests ? parseInt(maxGuests) : null,
        pricePerPerson: parseFloat(pricePerPerson),
      },
    })
    res.status(201).json(tier)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create pricing tier' })
  }
})

router.put('/packages/:id/tiers/:tierId', async (req, res) => {
  try {
    const { minGuests, maxGuests, pricePerPerson } = req.body
    const data = {}
    if (minGuests !== undefined) data.minGuests = parseInt(minGuests)
    if (maxGuests !== undefined) data.maxGuests = maxGuests ? parseInt(maxGuests) : null
    if (pricePerPerson !== undefined) data.pricePerPerson = parseFloat(pricePerPerson)
    const tier = await prisma.packagePricingTier.update({ where: { id: parseInt(req.params.tierId) }, data })
    res.json(tier)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pricing tier' })
  }
})

router.delete('/packages/:id/tiers/:tierId', async (req, res) => {
  try {
    await prisma.packagePricingTier.delete({ where: { id: parseInt(req.params.tierId) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete pricing tier' })
  }
})

// Package Category Rules
router.post('/packages/:id/rules', async (req, res) => {
  try {
    const { categoryId, label, minChoices, maxChoices, extraItemPrice, itemIds, items } = req.body
    // Support both itemIds (legacy) and items [{menuItemId, premiumPrice}]
    const itemsData = items?.length
      ? items.map(it => ({ menuItemId: parseInt(it.menuItemId), premiumPrice: it.premiumPrice != null ? parseFloat(it.premiumPrice) : null }))
      : itemIds?.length ? itemIds.map(id => ({ menuItemId: parseInt(id), premiumPrice: null })) : null
    const rule = await prisma.packageCategoryRule.create({
      data: {
        packageId: parseInt(req.params.id),
        categoryId: categoryId ? parseInt(categoryId) : null,
        label,
        minChoices: parseInt(minChoices || 1),
        maxChoices: parseInt(maxChoices),
        extraItemPrice: parseFloat(extraItemPrice || 0),
        allowedItems: itemsData ? { create: itemsData } : undefined,
      },
      include: {
        category: true,
        allowedItems: { include: { menuItem: { include: { category: true } } } },
      },
    })
    res.status(201).json(rule)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category rule' })
  }
})

router.put('/packages/:id/rules/:ruleId', async (req, res) => {
  try {
    const { categoryId, label, minChoices, maxChoices, extraItemPrice, itemIds, items, qtyPerPerson, qtyUnit } = req.body
    const ruleId = parseInt(req.params.ruleId)
    const data = {}
    if (categoryId !== undefined) data.categoryId = categoryId ? parseInt(categoryId) : null
    if (label !== undefined) data.label = label
    if (minChoices !== undefined) data.minChoices = parseInt(minChoices)
    if (maxChoices !== undefined) data.maxChoices = parseInt(maxChoices)
    if (extraItemPrice !== undefined) data.extraItemPrice = parseFloat(extraItemPrice)
    if (qtyPerPerson !== undefined) data.qtyPerPerson = qtyPerPerson != null ? parseFloat(qtyPerPerson) : null
    if (qtyUnit !== undefined) data.qtyUnit = qtyUnit || null

    // Replace allowed items if items or itemIds provided
    const itemsPayload = items !== undefined ? items : (itemIds !== undefined ? itemIds.map(id => ({ menuItemId: id, premiumPrice: null })) : undefined)
    if (itemsPayload !== undefined) {
      await prisma.packageCategoryRuleItem.deleteMany({ where: { ruleId } })
      if (itemsPayload.length > 0) {
        await prisma.packageCategoryRuleItem.createMany({
          data: itemsPayload.map(it => ({
            ruleId,
            menuItemId: parseInt(it.menuItemId ?? it),
            premiumPrice: it.premiumPrice != null ? parseFloat(it.premiumPrice) : null,
          })),
        })
      }
    }

    const rule = await prisma.packageCategoryRule.update({
      where: { id: ruleId },
      data,
      include: {
        category: true,
        allowedItems: { include: { menuItem: { include: { category: true } } } },
      },
    })
    res.json(rule)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category rule' })
  }
})

router.delete('/packages/:id/rules/:ruleId', async (req, res) => {
  try {
    await prisma.packageCategoryRule.delete({ where: { id: parseInt(req.params.ruleId) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category rule' })
  }
})

// Quote Requests
router.get('/quotes', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = {}
    if (status) where.status = status
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [quotes, count] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.quoteRequest.count({ where }),
    ])
    res.json({ quotes, total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quote requests' })
  }
})

router.patch('/quotes/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body
    const data = {}
    if (status) data.status = status
    if (adminNotes !== undefined) data.adminNotes = adminNotes
    const quote = await prisma.quoteRequest.update({ where: { id: parseInt(req.params.id) }, data })
    res.json(quote)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quote request' })
  }
})

// POST /api/admin/menu/import (Excel)
router.post('/menu/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)

    // Get category map
    const categories = await prisma.menuCategory.findMany()
    const catMap = {}
    categories.forEach(c => { catMap[c.name.toLowerCase()] = c.id })

    let created = 0
    for (const row of data) {
      if (!row.Name) continue

      const categoryId = catMap[row.Category?.toLowerCase()] || categories[0]?.id
      if (!categoryId) continue

      let active = true;
      if (row.Active !== undefined) {
        active = String(row.Active).toLowerCase() === 'true';
      }

      await prisma.menuItem.upsert({
        where: { id: parseInt(row.ID) || -1 },
        create: {
          name: row.Name, description: row.Description || null,
          categoryId, style: row.Style?.toUpperCase() || 'ANDHRA',
          type: row.Type?.toUpperCase() || 'VEG', price: parseFloat(row.Price || 0),
          active
        },
        update: {
          name: row.Name, description: row.Description || null,
          categoryId, price: parseFloat(row.Price || 0),
          active
        },
      }).catch(() => { })
      created++
    }
    res.json({ success: true, imported: created })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Import failed' })
  }
})

// GET /api/admin/menu/export (Excel)
router.get('/menu/export', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    })

    const data = items.map(item => ({
      ID: item.id,
      Name: item.name,
      Description: item.description || '',
      Category: item.category?.name || 'Uncategorized',
      Style: item.style,
      Type: item.type,
      Price: item.price,
      Active: item.active
    }))

    const worksheet = xlsx.utils.json_to_sheet(data)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'MenuItems')

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=menu_items.xlsx')
    res.send(buffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Export failed' })
  }
})


// ── REWARDS SETTINGS ──

// GET /api/admin/rewards/settings
router.get('/rewards/settings', authMiddleware, adminOnly, async (req, res) => {
  try {
    let s = await prisma.rewardSettings.findUnique({ where: { id: 1 } })
    if (!s) s = await prisma.rewardSettings.create({ data: { id: 1 } })
    res.json(s)
  } catch (err) {
    res.status(500).json({ error: 'Failed to load reward settings' })
  }
})

// PUT /api/admin/rewards/settings
router.put('/rewards/settings', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { enabled, pointsPer100, pointValue, expiryDays, minRedeem, silverMin, silverDiscount, goldMin, goldDiscount } = req.body
    const data = {}
    if (enabled !== undefined) data.enabled = Boolean(enabled)
    if (pointsPer100 !== undefined) data.pointsPer100 = parseFloat(pointsPer100)
    if (pointValue !== undefined) data.pointValue = parseFloat(pointValue)
    if (expiryDays !== undefined) data.expiryDays = expiryDays ? parseInt(expiryDays) : null
    if (minRedeem !== undefined) data.minRedeem = parseInt(minRedeem)
    if (silverMin !== undefined) data.silverMin = parseInt(silverMin)
    if (silverDiscount !== undefined) data.silverDiscount = parseFloat(silverDiscount)
    if (goldMin !== undefined) data.goldMin = parseInt(goldMin)
    if (goldDiscount !== undefined) data.goldDiscount = parseFloat(goldDiscount)
    const s = await prisma.rewardSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } })
    res.json(s)
  } catch (err) {
    res.status(500).json({ error: 'Failed to save reward settings' })
  }
})

// GET /api/admin/rewards/customers
router.get('/rewards/customers', authMiddleware, adminOnly, async (req, res) => {
  try {
    const settings = await prisma.rewardSettings.findUnique({ where: { id: 1 } }) || { pointsPer100: 4, pointValue: 0.25, silverMin: 500, goldMin: 2000 }
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: { bookings: { where: { status: 'COMPLETED' }, select: { total: true } } },
      orderBy: { createdAt: 'desc' },
    })
    const result = users.map(u => {
      const totalSpend = u.bookings.reduce((s, b) => s + (b.total || 0), 0)
      const points = Math.floor(totalSpend / 100) * settings.pointsPer100
      const tier = points >= settings.goldMin ? 'Gold' : points >= settings.silverMin ? 'Silver' : 'Bronze'
      return { id: u.id, name: u.name, email: u.email, phone: u.phone, totalSpend, points, tier, bookingCount: u.bookings.length }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to load customer rewards' })
  }
})


// ── DELIVERY SETTINGS ──

// GET /api/admin/delivery/settings
router.get('/delivery/settings', async (req, res) => {
  try {
    let s = await prisma.deliverySettings.findUnique({ where: { id: 1 } })
    if (!s) s = await prisma.deliverySettings.create({ data: { id: 1 } })
    res.json(s)
  } catch (err) {
    res.status(500).json({ error: 'Failed to load delivery settings' })
  }
})

// PUT /api/admin/delivery/settings
router.put('/delivery/settings', async (req, res) => {
  try {
    const fields = ['baseAddress','baseLat','baseLng','freeUpToKm','tier1MaxKm','tier1Charge','tier2MaxKm','tier2Charge','tier3MaxKm','tier3Charge','tier4MaxKm','tier4Charge','tier5Charge','maxDeliveryKm']
    const data = {}
    fields.forEach(f => { if (req.body[f] !== undefined) data[f] = typeof req.body[f] === 'string' ? parseFloat(req.body[f]) || req.body[f] : req.body[f] })
    if (req.body.baseAddress) data.baseAddress = req.body.baseAddress
    const s = await prisma.deliverySettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } })
    res.json(s)
  } catch (err) {
    res.status(500).json({ error: 'Failed to save delivery settings' })
  }
})

module.exports = router

// GET /api/admin/pricing/settings
router.get('/pricing/settings', async (req, res) => {
  try {
    let s = await prisma.pricingSettings.findUnique({ where: { id: 1 } })
    if (!s) s = await prisma.pricingSettings.create({ data: { id: 1 } })
    res.json(s)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/admin/pricing/settings
router.put('/pricing/settings', async (req, res) => {
  try {
    const fields = ['packingChargeFixed','mealboxDelivery','packedFoodDelivery','cateringDelivery','serviceChargeFlat','serviceChargeFreeAbove','freeDeliveryAbove','minAdvanceHours','gstPercent']
    const data = {}
    fields.forEach(f => { if (req.body[f] !== undefined) data[f] = Number(req.body[f]) })
    const s = await prisma.pricingSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } })
    res.json(s)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

