import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const bookingStep1Schema = z.object({
  eventType: z.string().min(1, 'Please select an event type'),
  eventDate: z.string().min(1, 'Please select a date'),
  guestCount: z.number().min(10, 'Minimum 10 guests').max(10000),
  venueAddress: z.string().min(3, 'Please enter venue address'),
  servingStyle: z.enum(['BUFFET', 'BANANA_LEAF', 'BOX_LUNCH']),
})
