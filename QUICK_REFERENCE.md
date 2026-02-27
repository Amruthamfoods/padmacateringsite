# 🚀 Quick Reference - Padma Catering Implementation

## Setup Commands (Copy & Paste)

```bash
# 1. Install dependencies
cd server
npm install

# 2. Create database migration (adds indexes)
npx prisma migrate dev --name add_indexes

# 3. Create logs directory
mkdir -p logs

# 4. Create .env file (see .env.example)
cp .env.example .env
# Edit .env with your actual credentials

# 5. Validate setup
npm run validate

# 6. Run tests
npm test

# 7. Check code quality
npm run lint

# 8. Check security vulnerabilities
npm run security-audit

# 9. Start development server
npm run dev
```

---

## Developer Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server with file watcher |
| `npm start` | Start production server |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run validate-env` | Check environment variables |
| `npm run validate` | Validate env + lint |
| `npm run security-audit` | Check for vulnerabilities |
| `npm run db:migrate` | Create new migration |
| `npm run db:seed` | Seed database with data |

---

## Key Files & Their Purpose

### Security & Validation
- `server/utils/envValidator.js` - Validates env vars at startup
- `server/utils/validationSchemas.js` - Joi schemas for all endpoints
- `server/utils/sanitizer.js` - Prevents XSS attacks
- `server/middleware/validate.js` - Applies validation to routes

### Logging & Error Handling
- `server/utils/logger.js` - Structured logging with Winston
- `server/index.js` - Global error handler (lines 115+)

### Rate Limiting
- `server/middleware/rateLimiter.js` - Auth: 10/15min, Booking: 10/1min

### Core Routes (Updated)
- `server/routes/booking.js` - Fixed price bypass, atomic coupons, logging
- `server/routes/auth.js` - Added logging and validation
- `server/routes/coupon.js` - Atomic transaction handling

### State Management (New)
- `booking-portal/src/store/useBookingStore.js` - Zustand store

### Configuration
- `.eslintrc.json` - Code quality rules
- `jest.config.js` - Testing configuration
- `.env.example` - Environment template

### Documentation
- `IMPLEMENTATION_SUMMARY.md` - Overview of all changes
- `IMPLEMENTATION_COMPLETE.md` - Detailed technical guide
- `SECURITY_SETUP.md` - Production deployment guide

---

## Logging Levels

```javascript
logger.debug('Debug info')      // Very detailed
logger.info('User logged in')   // Normal operations
logger.warn('Failed login')     // Warnings
logger.error('DB error', err)   // Errors
```

**Log Files:**
- `server/logs/combined.log` - All events
- `server/logs/error.log` - Errors only

---

## Common Errors & Fixes

### "Missing required environment variables"
```bash
# Fix: Check .env file
npm run validate-env
```

### "Database not available"
```bash
# Fix: Run migration
npx prisma migrate deploy
```

### "Too many requests"
```bash
# Fix: Wait 15 minutes (auth) or 1 minute (booking)
```

### "Lint errors"
```bash
# Fix: Auto-fix issues
npm run lint:fix
```

### "Tests failing"
```bash
# Fix: Check logs
npm test -- --verbose
```

---

## Validation Rules

### Booking Endpoint
- `eventType` - Required, 2-100 chars
- `eventDate` - Required, ISO date
- `guestCount` - Required, 10-10000
- `menuItemIds` - Required, min 1 item
- `vegCount + nonVegCount = guestCount` - Required match
- `guestEmail` - Optional, valid email if provided
- `guestPhone` - Optional, valid phone if provided

### Auth Endpoint
- `email` - Required, valid email format
- `password` - Required, min 6 characters
- `name` - Required (register), 2-100 chars

---

## Booking Price Calculation

```
Base = Item Prices × Guest Count
Packing = Base × 10%
Subtotal = Base + Packing + Addons + Delivery + Staff
Discount = Coupon (calculated atomically)
GST = (Subtotal - Discount) × 5%
Total = Subtotal - Discount + GST
```

**Server calculates everything - client input NOT trusted.**

---

## Testing Examples

```bash
# Run all tests
npm test

# Run specific test file
npm test -- booking.test.js

# Run tests with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run only validation tests
npm test -- validation.test.js
```

---

## Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `/api/auth/*` | 10 requests | 15 minutes |
| `/api/booking` | 10 requests | 1 minute |

**Rate limit errors:**
- Status: 429
- Message: "Too many requests"

---

## Security Checklist Before Production

- [ ] `npm run validate` passes
- [ ] `npm run lint` shows no errors
- [ ] `npm test` passes
- [ ] `npm run security-audit` shows no critical issues
- [ ] `.env` file created (NOT in git)
- [ ] Database migration applied
- [ ] Logs directory created
- [ ] JWT_SECRET is 32+ chars and unique
- [ ] CORS_ORIGIN configured for your domain
- [ ] Email credentials tested
- [ ] Database backups configured
- [ ] HTTPS enabled (production only)
- [ ] NODE_ENV=production set

---

## Zustand Store Usage

```javascript
import { useBookingStore } from './store/useBookingStore'

// In component
export default function MyComponent() {
  const { eventDetails, setEventDetails } = useBookingStore()
  
  // Update state
  setEventDetails({ occasion: 'Birthday' })
  
  // Read state
  console.log(eventDetails.guestCount)
  
  // Get booking for API
  const booking = useBookingStore((state) => state.getBookingPayload())
}
```

**State auto-persists to localStorage as `padma-booking-store`**

---

## GitHub Actions CI/CD

Pipeline runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
1. Lint - Code quality check
2. Security - npm audit scan
3. Test - Unit & integration tests
4. Validate - Environment validation

See `.github/workflows/security.yml` for details.

---

## Support

- **Errors in logs:** Check `server/logs/error.log`
- **Test failures:** Run `npm test -- --verbose`
- **Lint issued:** Run `npm run lint:fix`
- **Env issues:** Run `npm run validate-env`

---

**Last Updated:** February 27, 2026  
**Status:** ✅ All recommendations implemented