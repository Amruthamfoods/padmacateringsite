const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// GET /api/menu/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })
    res.json(categories)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/menu/items?category=&type=&style=
router.get('/items', async (req, res) => {
  try {
    const { category, type, style } = req.query
    const where = { active: true }
    if (category) where.categoryId = parseInt(category)
    if (type) where.type = type
    if (style) where.style = style

    const items = await prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    })
    res.json(items)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch items' })
  }
})

// GET /api/menu/packages
router.get('/packages', async (req, res) => {
  try {
    const packages = await prisma.menuPackage.findMany({
      include: {
        items: {
          include: {
            menuItem: { include: { category: true } },
          },
        },
        pricingTiers: { orderBy: { minGuests: 'desc' } },
        categoryRules: { include: { category: true }, orderBy: { id: 'asc' } },
      },
      orderBy: { basePrice: 'asc' },
    })
    res.json(packages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch packages' })
  }
})

// GET /api/menu/blocked-dates
router.get('/blocked-dates', async (req, res) => {
  try {
    const dates = await prisma.blockedDate.findMany({ orderBy: { date: 'asc' } })
    res.json(dates.map(d => d.date.toISOString().split('T')[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch blocked dates' })
  }
})

module.exports = router
