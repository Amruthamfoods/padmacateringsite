/**
 * Joi Validation Schemas
 * Centralized validation for all API inputs
 */

const Joi = require('joi')

const schemas = {
  // Auth schemas
  register: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
    }),
    phone: Joi.string().pattern(/^[0-9\s\-\+\(\)]{10,15}$/).optional().allow(null),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Booking schema
  createBooking: Joi.object({
    eventType: Joi.string().trim().min(2).max(100).required(),
    eventDate: Joi.date().iso().required().messages({
      'date.base': 'Invalid date format',
    }),
    guestCount: Joi.number().integer().min(10).max(10000).required().messages({
      'number.min': 'Minimum 10 guests required',
      'number.max': 'Maximum 10000 guests allowed',
    }),
    vegCount: Joi.number().integer().min(0).required(),
    nonVegCount: Joi.number().integer().min(0).required(),
    venueAddress: Joi.string().trim().max(500).optional().allow(null),
    servingStyle: Joi.string().valid('BUFFET', 'BANANA_LEAF', 'BOX_LUNCH').default('BUFFET'),
    deliveryType: Joi.string().valid('GATE', 'DOORSTEP', 'DOORSTEP_SERVICE').default('GATE'),
    deliveryCharge: Joi.number().min(0).default(0),
    staffCount: Joi.number().integer().min(0).max(100).default(0),
    addonCost: Joi.number().min(0).default(0),
    dietPreference: Joi.string().valid('VEG', 'NON_VEG', 'SEPARATE').default('NON_VEG'),
    spiceLevel: Joi.string().valid('MILD', 'MEDIUM', 'SPICY').default('MEDIUM'),
    timeSlot: Joi.string().optional().allow(null),
    paymentPlan: Joi.string().valid('FULL', 'ADVANCE').default('FULL'),
    menuItemIds: Joi.array().items(Joi.number().integer()).min(1).required().messages({
      'array.min': 'Please select at least one menu item',
    }),
    specialInstructions: Joi.string().trim().max(1000).optional().allow(null),
    couponCode: Joi.string().uppercase().pattern(/^[A-Z0-9_\-]{3,20}$/).optional().allow(null),
    couponId: Joi.number().integer().optional(),
    guestName: Joi.string().trim().min(2).max(100).optional().allow(null),
    guestEmail: Joi.string().email().optional().allow(null),
    guestPhone: Joi.string().pattern(/^[0-9\s\-\+\(\)]{10,15}$/).optional().allow(null),
    packageId: Joi.number().integer().optional(),
    pricePerPerson: Joi.number().min(0).optional(),
  }).custom((value, helpers) => {
    // Validate veg + non-veg equals total guests
    if ((value.vegCount || 0) + (value.nonVegCount || 0) !== value.guestCount) {
      return helpers.error('any.invalid')
    }
    return value
  }, 'veg+nonveg validation').messages({
    'any.invalid': 'Veg count + Non-veg count must equal total guest count',
  }),

  // Coupon validation
  validateCoupon: Joi.object({
    code: Joi.string().uppercase().pattern(/^[A-Z0-9_\-]{3,20}$/).required().messages({
      'string.pattern.base': 'Invalid coupon format',
    }),
    orderValue: Joi.number().min(0).required(),
  }),

  // Contact form
  contactForm: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().optional().allow(null),
    phone: Joi.string().pattern(/^[0-9\s\-\+\(\)]{10,15}$/).required(),
    subject: Joi.string().trim().min(3).max(100).optional().allow(null),
    message: Joi.string().trim().min(10).max(2000).required(),
  }),

  // Quote request
  createQuote: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9\s\-\+\(\)]{10,15}$/).required(),
    eventType: Joi.string().trim().min(2).max(100).required(),
    eventDate: Joi.date().iso().required(),
    guestCount: Joi.number().integer().min(10).max(10000).required(),
    venueAddress: Joi.string().trim().max(500).optional().allow(null),
    servingStyle: Joi.string().valid('BUFFET', 'BANANA_LEAF', 'BOX_LUNCH').required(),
    specialInstructions: Joi.string().trim().max(1000).optional().allow(null),
  }),
}

module.exports = schemas
