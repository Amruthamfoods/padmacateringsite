const router = require('express').Router()
const multer = require('multer')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

const prisma = new PrismaClient()
const upload = multer({ storage: multer.memoryStorage() })

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
    if (eventType) where.eventType = eventType
    if (from || to) {
      where.eventDate = {}
      if (from) where.eventDate.gte = new Date(from)
      if (to) where.eventDate.lte = new Date(to)
    }
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [bookings, count] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          menuItems: { include: { menuItem: { select: { name: true } } } },
          coupon: { select: { code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ])
    res.json({ bookings, total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) })
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
    const booking = await prisma.booking.update({ where: { id: parseInt(req.params.id) }, data })
    res.json(booking)
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
    const { date, reason } = req.body
    const blocked = await prisma.blockedDate.create({ data: { date: new Date(date), reason: reason || null } })
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
    const { name, description, image, categoryId, style, type, active, price } = req.body
    const item = await prisma.menuItem.create({
      data: {
        name, description: description || null, image: image || null,
        categoryId: parseInt(categoryId), style: style || 'ANDHRA',
        type: type || 'VEG', active: active !== false, price: parseFloat(price || 0),
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
    const { name, description, image, categoryId, style, type, active, price } = req.body
    const data = {}
    if (name) data.name = name
    if (description !== undefined) data.description = description
    if (image !== undefined) data.image = image
    if (categoryId) data.categoryId = parseInt(categoryId)
    if (style) data.style = style
    if (type) data.type = type
    if (active !== undefined) data.active = active
    if (price !== undefined) data.price = parseFloat(price)
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
    const { name, eventType, style, type, servesMin, description, basePrice, itemIds } = req.body
    const pkg = await prisma.menuPackage.create({
      data: {
        name, eventType: eventType || null, style: style || 'ANDHRA', type: type || 'VEG',
        servesMin: parseInt(servesMin || 50), description: description || null,
        basePrice: parseFloat(basePrice || 0),
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
    const { name, eventType, style, type, servesMin, description, basePrice } = req.body
    const data = {}
    if (name) data.name = name
    if (eventType !== undefined) data.eventType = eventType
    if (style) data.style = style
    if (type) data.type = type
    if (servesMin) data.servesMin = parseInt(servesMin)
    if (description !== undefined) data.description = description
    if (basePrice !== undefined) data.basePrice = parseFloat(basePrice)
    const pkg = await prisma.menuPackage.update({
      where: { id: parseInt(req.params.id) }, data,
      include: { items: { include: { menuItem: true } } },
    })
    res.json(pkg)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update package' })
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

// Package Pricing Tiers
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
    const { categoryId, label, minChoices, maxChoices, extraItemPrice, itemIds } = req.body
    const rule = await prisma.packageCategoryRule.create({
      data: {
        packageId: parseInt(req.params.id),
        categoryId: parseInt(categoryId),
        label,
        minChoices: parseInt(minChoices || 1),
        maxChoices: parseInt(maxChoices),
        extraItemPrice: parseFloat(extraItemPrice || 0),
        allowedItems: itemIds?.length
          ? { create: itemIds.map(id => ({ menuItemId: parseInt(id) })) }
          : undefined,
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
    const { categoryId, label, minChoices, maxChoices, extraItemPrice, itemIds } = req.body
    const ruleId = parseInt(req.params.ruleId)
    const data = {}
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId)
    if (label !== undefined) data.label = label
    if (minChoices !== undefined) data.minChoices = parseInt(minChoices)
    if (maxChoices !== undefined) data.maxChoices = parseInt(maxChoices)
    if (extraItemPrice !== undefined) data.extraItemPrice = parseFloat(extraItemPrice)

    // Replace allowed items if itemIds provided
    if (itemIds !== undefined) {
      await prisma.packageCategoryRuleItem.deleteMany({ where: { ruleId } })
      if (itemIds.length > 0) {
        await prisma.packageCategoryRuleItem.createMany({
          data: itemIds.map(id => ({ ruleId, menuItemId: parseInt(id) })),
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

// POST /api/admin/menu/import (CSV)
router.post('/menu/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const csv = req.file.buffer.toString('utf-8')
    const lines = csv.split('\n').filter(l => l.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const rows = lines.slice(1)

    // Get category map
    const categories = await prisma.menuCategory.findMany()
    const catMap = {}
    categories.forEach(c => { catMap[c.name.toLowerCase()] = c.id })

    let created = 0
    for (const row of rows) {
      const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      const obj = {}
      headers.forEach((h, i) => { obj[h] = cols[i] })
      const categoryId = catMap[obj.category?.toLowerCase()] || categories[0]?.id
      if (!categoryId || !obj.name) continue
      await prisma.menuItem.upsert({
        where: { id: parseInt(obj.id || 0) || 0 },
        create: {
          name: obj.name, description: obj.description || null,
          categoryId, style: obj.style?.toUpperCase() || 'ANDHRA',
          type: obj.type?.toUpperCase() || 'VEG', price: parseFloat(obj.price || 0),
        },
        update: {
          name: obj.name, description: obj.description || null,
          categoryId, price: parseFloat(obj.price || 0),
        },
      }).catch(() => {})
      created++
    }
    res.json({ success: true, imported: created })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Import failed' })
  }
})

module.exports = router
