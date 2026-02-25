const router = require('express').Router()
const nodemailer = require('nodemailer')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
})

// POST /api/quote
router.post('/', async (req, res) => {
  try {
    const {
      name, email, phone, eventType, eventDate, guestCount,
      venueAddress, servingStyle, specialInstructions, selectedItems,
      userId,
    } = req.body

    if (!name || !phone || !eventType || !eventDate || !guestCount) {
      return res.status(400).json({ error: 'name, phone, eventType, eventDate and guestCount are required' })
    }
    if (!selectedItems || selectedItems.length < 1) {
      return res.status(400).json({ error: 'Please select at least one menu item' })
    }

    // Get userId from token if available
    const authHeader = req.headers['authorization']
    let resolvedUserId = userId ? parseInt(userId) : null
    if (!resolvedUserId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
        resolvedUserId = decoded.id
      } catch {}
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        name,
        email: email || '',
        phone,
        eventType,
        eventDate: new Date(eventDate),
        guestCount: parseInt(guestCount),
        venueAddress: venueAddress || null,
        servingStyle: servingStyle || 'BUFFET',
        specialInstructions: specialInstructions || null,
        selectedItemsJson: JSON.stringify(selectedItems),
        userId: resolvedUserId,
      },
    })

    // Group items by category for email
    const grouped = {}
    selectedItems.forEach(item => {
      const cat = item.category || 'Other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(item.name)
    })
    const menuHtml = Object.entries(grouped).map(([cat, names]) =>
      `<tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:bold;">${cat}</td><td style="padding:8px 12px;">${names.join(', ')}</td></tr>`
    ).join('')

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#8B0000;border-bottom:2px solid #D4AF37;padding-bottom:8px;">
          New Quote Request #${quote.id} — Padma Catering
        </h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;width:35%;">Customer</td><td style="padding:10px;">${name}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Phone</td><td style="padding:10px;">${phone}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Email</td><td style="padding:10px;">${email || 'N/A'}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Event Type</td><td style="padding:10px;">${eventType}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Event Date</td><td style="padding:10px;">${eventDate}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Guests</td><td style="padding:10px;">${guestCount}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Venue</td><td style="padding:10px;">${venueAddress || 'TBD'}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Serving Style</td><td style="padding:10px;">${servingStyle || 'BUFFET'}</td></tr>
          ${specialInstructions ? `<tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Special Notes</td><td style="padding:10px;">${specialInstructions}</td></tr>` : ''}
        </table>
        <h3 style="color:#8B0000;margin-top:20px;">Selected Menu Items</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${menuHtml}</table>
      </div>`

    transporter.sendMail({
      from: `"Padma Catering Booking" <${process.env.GMAIL_USER}>`,
      to: 'amruthamfoodsvizag@gmail.com',
      subject: `New Quote Request #${quote.id}: ${eventType} — ${name} (${guestCount} guests)`,
      html: adminHtml,
    }).catch(e => console.error('Quote email error:', e.message))

    res.status(201).json({ quoteId: quote.id })
  } catch (err) {
    console.error('Quote error:', err)
    res.status(500).json({ error: 'Failed to create quote request' })
  }
})

module.exports = router
