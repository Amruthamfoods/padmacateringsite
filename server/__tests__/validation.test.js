/**
 * Middleware Tests - Input Validation
 */

const validate = require('../../middleware/validate')
const express = require('express')

describe('Validation Middleware', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
  })

  describe('createBooking validation', () => {
    beforeEach(() => {
      app.post('/test', validate('createBooking'), (req, res) => {
        res.json({ success: true, data: req.body })
      })
    })

    it('should accept valid booking data', async () => {
      const validData = {
        eventType: 'Birthday',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        guestCount: 50,
        vegCount: 25,
        nonVegCount: 25,
        menuItemIds: [1, 2, 3],
      }

      const response = await request(app).post('/test').send(validData)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should reject veg + nonveg mismatch', async () => {
      const invalidData = {
        eventType: 'Birthday',
        eventDate: new Date().toISOString(),
        guestCount: 50,
        vegCount: 30,
        nonVegCount: 30, // Should be 20
        menuItemIds: [1, 2],
      }

      const response = await request(app).post('/test').send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.details).toBeDefined()
    })

    it('should validate email format in guest email', async () => {
      const invalidData = {
        eventType: 'Birthday',
        eventDate: new Date().toISOString(),
        guestCount: 50,
        vegCount: 25,
        nonVegCount: 25,
        menuItemIds: [1, 2],
        guestEmail: 'invalid-email', // Invalid format
      }

      const response = await request(app).post('/test').send(invalidData)

      expect(response.status).toBe(400)
    })
  })

  describe('Auth validation', () => {
    beforeEach(() => {
      app.post('/test-auth', validate('login'), (req, res) => {
        res.json({ success: true })
      })
    })

    it('should require email and password', async () => {
      const response = await request(app).post('/test-auth').send({})

      expect(response.status).toBe(400)
      expect(response.body.details).toBeDefined()
    })

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/test-auth')
        .send({ email: 'not-an-email', password: 'password123' })

      expect(response.status).toBe(400)
    })
  })
})
