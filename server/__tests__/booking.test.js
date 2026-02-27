/**
 * Integration Tests - Booking Flow
 * Tests complete booking creation workflow
 */

const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bookingRouter = require('../../routes/booking')

const prisma = new PrismaClient()

describe('Booking Endpoints', () => {
  let app
  let authToken

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/api/booking', bookingRouter)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /api/booking', () => {
    it('should create a booking with valid data', async () => {
      const bookingData = {
        eventType: 'Birthday Party',
        eventDate: '2025-03-15',
        guestCount: 50,
        vegCount: 25,
        nonVegCount: 25,
        venueAddress: 'Test Venue, City',
        deliveryType: 'GATE',
        deliveryCharge: 0,
        staffCount: 2,
        addonCost: 500,
        dietPreference: 'NON_VEG',
        spiceLevel: 'MEDIUM',
        timeSlot: '11:30 AM - 12:30 PM',
        paymentPlan: 'FULL',
        menuItemIds: [1, 2, 3],
        specialInstructions: 'No onions',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '9876543210',
      }

      const response = await request(app).post('/api/booking').send(bookingData)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('bookingId')
      expect(response.body).toHaveProperty('razorpayOrder')
      expect(response.body).toHaveProperty('total')
    })

    it('should reject booking with guest count < 10', async () => {
      const bookingData = {
        eventType: 'Birthday Party',
        eventDate: '2025-03-15',
        guestCount: 5, // Less than minimum
        vegCount: 3,
        nonVegCount: 2,
        venueAddress: 'Test Venue',
        menuItemIds: [1, 2],
      }

      const response = await request(app).post('/api/booking').send(bookingData)

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('10 guests') || response.body.details.some((d) => d.includes('10'))
    })

    it('should reject booking with invalid coupon', async () => {
      const bookingData = {
        eventType: 'Birthday Party',
        eventDate: '2025-03-15',
        guestCount: 50,
        vegCount: 25,
        nonVegCount: 25,
        venueAddress: 'Test Venue',
        menuItemIds: [1, 2, 3],
        couponCode: 'INVALID_COUPON_CODE_XYZ',
      }

      const response = await request(app).post('/api/booking').send(bookingData)

      expect(response.status).toBe(201) // Booking should still create without coupon
      expect(response.body.body.couponId).toBeNull()
    })

    it('should calculate prices server-side (not trust client total)', async () => {
      const bookingData = {
        eventType: 'Birthday Party',
        eventDate: '2025-03-15',
        guestCount: 100,
        vegCount: 50,
        nonVegCount: 50,
        venueAddress: 'Test Venue',
        menuItemIds: [1, 2],
        totalAmount: 999999, // Try to manipulate price
      }

      const response = await request(app).post('/api/booking').send(bookingData)

      expect(response.status).toBe(201)
      // Server should calculate correct price, not use client's 999999
      const correctPrice = await calculateExpectedPrice(bookingData)
      expect(parseInt(response.body.total)).toBe(correctPrice)
    })
  })

  describe('GET /api/booking/my', () => {
    it('should return bookings for authenticated user', async () => {
      // This test requires authentication middleware
      // Mock token-based auth for testing
      const response = await request(app)
        .get('/api/booking/my')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })
})

// Helper to calculate expected price
async function calculateExpectedPrice(bookingData) {
  const items = await prisma.menuItem.findMany({
    where: { id: { in: bookingData.menuItemIds } },
  })
  const baseTotal = items.reduce((sum, item) => sum + item.price, 0) * bookingData.guestCount
  const packingCost = Math.round(baseTotal * 0.1)
  const subtotal = baseTotal + packingCost
  const gst = Math.round(subtotal * 0.05)
  return subtotal + gst
}
