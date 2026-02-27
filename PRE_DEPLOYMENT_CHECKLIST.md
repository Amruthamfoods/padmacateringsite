# ✅ Pre-Deployment Checklist

Complete this checklist before deploying to production.

## 📋 Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running and accessible
- [ ] Git configured and repository ready
- [ ] Local development environment working
- [ ] All tests passing (`npm test`)
- [ ] Linting passes (`npm run lint`)

## 🔐 Security Configuration

### Environment Variables
- [ ] `.env` created from `.env.example`
- [ ] `DATABASE_URL` configured with production database
- [ ] `JWT_SECRET` is 32+ random characters (use: `openssl rand -base64 32`)
- [ ] `CORS_ORIGIN` set to production domain(s)
- [ ] `NODE_ENV` set to `"production"`
- [ ] `RAZORPAY_KEY_ID` configured (production keys)
- [ ] `RAZORPAY_KEY_SECRET` configured (production keys)
- [ ] `GMAIL_USER` and `GMAIL_PASS` configured
- [ ] Admin password changed from default `admin123`

### Security Checks
- [ ] No hardcoded credentials in code
- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] `npm run security-audit` passes with no critical issues
- [ ] All dependencies up-to-date (`npm audit` OK)
- [ ] CORS properly restricted to allowed domains
- [ ] Database connection uses SSL in production

## 📦 Database Setup

- [ ] PostgreSQL database created
- [ ] Database user created with appropriate permissions
- [ ] Connection string verified in `.env`
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Database indexed: `npx prisma db push`
- [ ] Seed data loaded (optional): `npm run seed`
- [ ] Backup strategy configured
- [ ] Database credentials stored securely (not in .env!)

## 🛠️ Build & Testing

### Backend
- [ ] `npm install` completed without errors
- [ ] `npm run validate` passes
- [ ] `npm test` all tests pass
- [ ] `npm run lint` no errors (warnings OK)
- [ ] All route tests passing
- [ ] Integration tests passing
- [ ] Error handling middleware in place

### Frontend - Main Site
- [ ] `npm install` completed
- [ ] `npm run build` succeeds
- [ ] Build output in `dist/` folder
- [ ] No console errors in production build
- [ ] Responsive on mobile/tablet/desktop
- [ ] Routes work correctly (no 404s)

### Frontend - Booking Portal
- [ ] `npm install` completed
- [ ] `npm run build` succeeds
- [ ] Build output in `dist/` folder
- [ ] Complete booking flow tested locally
- [ ] Payment flow works (Razorpay test)
- [ ] Form validation works
- [ ] Error messages display properly

## ✨ Feature Verification

### Booking System
- [ ] Create booking flow works end-to-end
- [ ] Price calculation correct (base + packing + addons + delivery + staff - coupon + GST)
- [ ] Coupon application works
- [ ] Guest count validation enforced
- [ ] Menu selection validation enforced
- [ ] Payment integration ready

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT token generation working
- [ ] Token expiration configured (7 days default)
- [ ] Password hashing working (bcryptjs)
- [ ] Admin login works with new credentials

### Admin Panel
- [ ] Admin can view bookings
- [ ] Admin can view quotes
- [ ] Admin can manage coupons
- [ ] Admin can manage menus
- [ ] Admin can view analytics
- [ ] Admin authentication required for all pages

### Email
- [ ] SMTP credentials configured
- [ ] Test email sends successfully
- [ ] Booking confirmation email template ready
- [ ] Quote notification emails working
- [ ] Admin notification emails configured

### Logging
- [ ] Logs directory exists (`server/logs/`)
- [ ] Error logs capturing failures
- [ ] Combined logs capturing all operations
- [ ] Log rotation configured (if needed)
- [ ] Log files not committed to git

## 🚀 Deployment Infrastructure

### Server Setup
- [ ] SSH access configured to server
- [ ] Server running Ubuntu/Debian
- [ ] Node.js 18+ installed on server
- [ ] PostgreSQL installed and running
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Nginx installed and configured
- [ ] SSL certificates provisioned (Let's Encrypt)

### Reverse Proxy (Nginx)
- [ ] Nginx config created for API proxy
- [ ] Nginx config for main site static files
- [ ] Nginx config for booking portal static files
- [ ] HTTPS redirect configured (80 → 443)
- [ ] CORS headers configured properly
- [ ] Gzip compression enabled
- [ ] Static file caching configured

### Process Management (PM2)
- [ ] PM2 configured to start on server reboot
- [ ] PM2 ecosystem file created (optional)
- [ ] PM2 logs configured for persistent storage
- [ ] PM2 restart on crash configured
- [ ] Monitored processes listed in PM2

### Database Backups
- [ ] Automated backups scheduled (daily)
- [ ] Backup storage configured (external drive/S3)
- [ ] Restore procedure tested
- [ ] Point-in-time recovery enabled (if available)
- [ ] Backup retention policy set (30 days minimum)

## 📊 Monitoring & Alerting

- [ ] Server uptime monitoring configured (UptimeRobot, etc.)
- [ ] Error logging/alerting configured (Sentry, etc.)
- [ ] Database monitoring enabled
- [ ] CPU/memory monitoring active
- [ ] Disk space monitoring active
- [ ] Email alerts configured for critical issues
- [ ] Log aggregation configured (Datadog, etc.)
- [ ] Performance monitoring setup (New Relic, etc.)

## 🔄 CI/CD Pipeline

- [ ] GitHub Actions workflow configured
- [ ] Auto-tests run on PR
- [ ] Linting enforced on commits
- [ ] Security audit runs automatically
- [ ] Deployment script automated (optional)
- [ ] Environment validation runs before deploy
- [ ] Code coverage tracked

## 📝 Documentation

- [ ] `DEPLOY_GUIDE.md` reviewed and up-to-date
- [ ] `QUICK_REFERENCE.md` available for development team
- [ ] `IMPLEMENTATION_COMPLETE.md` reviewed
- [ ] API documentation available
- [ ] Database schema documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide created

## 🧪 Pre-Launch Testing

### Smoke Tests (Do These!)
- [ ] Main site loads at `https://padmacatering.com`
- [ ] Booking portal loads at `https://booking.padmacatering.com`
- [ ] Admin panel loads at `https://padmacatering.com/admin`
- [ ] Create booking flow works end-to-end
- [ ] Payment page loads (Razorpay)
- [ ] Success page displays after payment
- [ ] Admin can view new booking
- [ ] Confirmation email received

### Edge Cases
- [ ] Invalid coupon code handled gracefully
- [ ] Expired coupon handled
- [ ] Coupon usage limits enforced
- [ ] Guest count validation enforced
- [ ] Invalid email format rejected
- [ ] Network error handling works
- [ ] Timeout handling works
- [ ] Large file uploads handled

### Performance
- [ ] Page load time < 3 seconds
- [ ] Booking submission < 1 second
- [ ] API responses < 500ms
- [ ] Database queries optimized (use EXPLAIN)
- [ ] No N+1 query problems
- [ ] Memory usage stable over time

## ⚡ Day-1 Operations

- [ ] Team notified of launch
- [ ] DNS updated to point to new server
- [ ] SSL certificate active
- [ ] Team monitors logs for errors
- [ ] Support team trained on admin panel
- [ ] Customer support notified of new features
- [ ] Analytics/tracking enabled
- [ ] Payment reconciliation verified

## 📞 Rollback Plan

- [ ] Previous version tagged in git for rollback
- [ ] Database backup taken before deployment
- [ ] Rollback procedure documented
- [ ] PM2 can restart previous version quickly
- [ ] DNS failover configured (if redundant servers)
- [ ] Team knows how to execute rollback

## ✅ Final Sign-Off

- [ ] **Developer Lead:** _____________________ Date: _______
- [ ] **QA/Testing:** _____________________ Date: _______
- [ ] **DevOps/Operations:** _____________________ Date: _______
- [ ] **Project Manager:** _____________________ Date: _______

---

## 🚀 Ready to Deploy!

Once all items are checked:

1. **Do final backup:** `pg_dump -U postgres padma_prod > backup_final.sql`
2. **Execute deployment:** `bash deploy.sh` on remote server
3. **Monitor logs:** `pm2 logs padma-server`
4. **Test platform:** Visit production URLs and go through booking flow
5. **Alert team:** Notify stakeholders that platform is live
6. **Monitor for 24hrs:** Watch for errors and performance issues

**Deployment time:** Typically 10-15 minutes
**Expected downtime:** 0 minutes (if deployment done right)

---

**If you have any blockers, do NOT deploy. Resolve them first.**
