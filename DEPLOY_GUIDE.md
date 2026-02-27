# 🚀 Padma Catering - Deployment & Launch Guide

Complete step-by-step guide to deploy and launch the platform.

---

## 🏃 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL running with a database created
- Git installed

### 1. Clone/Setup Database

```bash
# Create PostgreSQL database
createdb padma_catering

# Or via psql:
psql
CREATE DATABASE padma_catering;
\q
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your database URL and credentials
nano .env
```

**Minimum required in .env:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/padma_catering"
JWT_SECRET="your-secret-key-minimum-32-characters-long-generated-key"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
GMAIL_USER="your-email@gmail.com"
GMAIL_PASS="your-app-password"
```

### 3. Install Dependencies & Setup Database

```bash
# Backend
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed  # Optional: seed sample data

# Main site
cd ../main-site
npm install

# Booking portal
cd ../booking-portal
npm install
```

### 4. Validate Everything

```bash
cd server
npm run validate  # Checks environment + linting
npm test          # Run all tests
npm run security-audit
```

### 5. Launch Development Environment

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
# Output: Server running on http://localhost:3001
```

**Terminal 2 - Main Site:**
```bash
cd main-site
npm run dev
# Output: http://localhost:5173/padmacateringsite/
```

**Terminal 3 - Booking Portal:**
```bash
cd booking-portal
npm run dev
# Output: http://localhost:5174/booking/
```

### 6. Test the Platform

- **Main Site:** http://localhost:5173/padmacateringsite/
- **Booking Portal:** http://localhost:5174/booking/
- **Admin Panel:** http://localhost:5173/padmacateringsite/admin/
- **API Docs:** http://localhost:3001/api/health

**Admin Credentials:**
- Email: `admin@padmacatering.com`
- Password: `admin123`

---

## 📦 Production Deployment (Remote Server)

### Prerequisites
- Remote server access (SSH to `root@187.77.186.38`)
- PostgreSQL running on server
- PM2 installed globally: `npm install -g pm2`
- Git repository configured

### Step 1: SSH Into Server

```bash
ssh root@187.77.186.38
```

### Step 2: Clone Repository

```bash
cd /var/www
git clone <your-repo-url> padma-react
cd padma-react
```

### Step 3: Setup Environment

```bash
cd server
cp .env.example .env
nano .env  # Use production values
```

**Production .env values:**
```
DATABASE_URL="postgresql://prod_user:prod_pass@localhost:5432/padma_prod"
JWT_SECRET="<generate-32-char-random-string>"
PORT=3001
NODE_ENV="production"
CORS_ORIGIN="https://padmacatering.com,https://booking.padmacatering.com"
RAZORPAY_KEY_ID="<production-razorpay-key>"
RAZORPAY_KEY_SECRET="<production-razorpay-secret>"
GMAIL_USER="notifications@padmacatering.com"
GMAIL_PASS="<app-specific-password>"
```

### Step 4: Install & Build

```bash
cd /var/www/padma-react

# Backend
cd server && npm install && cd ..

# Build frontend applications
cd main-site && npm install && npm run build && cd ..
cd booking-portal && npm install && npm run build && cd ..

# Setup database
cd server
npx prisma generate
npx prisma migrate deploy  # Use 'deploy' in production (not 'dev')
cd /var/www/padma-react
```

### Step 5: Start Services with PM2

```bash
cd /var/www/padma-react/server

# Start server with PM2
pm2 start index.js --name "padma-server" --env production

# Configure auto-restart on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs padma-server  # View logs
```

### Step 6: Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/padma`:

```nginx
upstream padma_api {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name padmacatering.com;
    
    # API routes
    location /api/ {
        proxy_pass http://padma_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files - main site (after build)
    location / {
        root /var/www/padma-react/main-site/dist;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 80;
    server_name booking.padmacatering.com;
    
    # Static files - booking portal (after build)
    location / {
        root /var/www/padma-react/booking-portal/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to main API server
    location /api/ {
        proxy_pass http://padma_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/padma /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: Setup HTTPS with Let's Encrypt

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d padmacatering.com -d booking.padmacatering.com

# Auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer
```

### Step 8: Deploy with Script

After initial setup, use the automated deploy script:

```bash
cd /var/www/padma-react
bash deploy.sh
```

This script:
- Pulls latest code from git
- Builds both frontend applications
- Installs dependencies
- Restarts the PM2 process

---

## ✅ Production Checklist

### Pre-Launch
- [ ] Environment variables configured (.env filled with production values)
- [ ] Database backups configured
- [ ] SSL certificates installed (HTTPS enabled)
- [ ] Email service credentials verified
- [ ] Razorpay production keys configured
- [ ] Admin credentials changed from defaults
- [ ] CORS_ORIGIN updated to production domain
- [ ] NODE_ENV set to "production"

### Security
- [ ] Security audit passed: `npm run security-audit`
- [ ] All dependencies up-to-date: `npm audit` passes
- [ ] Rate limiting enabled on API endpoints
- [ ] CSRF protection enabled
- [ ] Input sanitization active
- [ ] Database indexes created and optimized
- [ ] Logging to files configured (server/logs/)
- [ ] Error handling middleware active

### Performance
- [ ] Frontend builds optimized (`npm run build`)
- [ ] Database connection pooling configured
- [ ] Nginx caching configured
- [ ] Gzip compression enabled
- [ ] CDN configured for static assets (optional)

### Monitoring
- [ ] PM2 process manager monitoring active
- [ ] Logs monitored: `pm2 logs padma-server`
- [ ] Error alerts configured (optional: Sentry, LogRocket)
- [ ] Database backups scheduled
- [ ] Uptime monitoring configured (optional)

### Testing
- [ ] Full booking flow tested on production
- [ ] Payment gateway integration tested (Razorpay)
- [ ] Email notifications verified
- [ ] Admin panel accessible with new credentials
- [ ] Mobile responsiveness verified

---

## 🔄 Continuous Deployment

Once deployed, automate updates:

```bash
# On your local machine, push code to GitHub
git push origin main

# On server, pull and deploy
cd /var/www/padma-react
bash deploy.sh
```

Or setup GitHub Actions for automatic deployment on push (see `.github/workflows/security.yml` for CI/CD framework).

---

## 📊 Monitoring & Maintenance

### View Server Logs
```bash
pm2 logs padma-server              # Real-time logs
pm2 logs padma-server --lines 100  # Last 100 lines
pm2 save                           # Save PM2 state
```

### View Application Logs
```bash
cd /var/www/padma-react/server/logs
tail -f combined.log    # All logs
tail -f error.log       # Errors only
```

### Restart Services
```bash
pm2 restart padma-server  # Restart API
systemctl restart nginx    # Restart web server
```

### Database Maintenance
```bash
# Backup
pg_dump -U postgres padma_prod > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres padma_prod < backup_backup_date.sql

# Vacuum (optimize)
psql -U postgres -d padma_prod -c "VACUUM ANALYZE;"
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -i :3001
kill -9 <PID>
```

### Database Connection Error
```bash
# Check database is running
psql -U postgres -d padma_prod

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Build Failure
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### PM2 Issues
```bash
# Check status
pm2 status

# Restart all
pm2 restart all

# View errors
pm2 logs --err
```

---

## 📞 Support & Documentation

- **Quick Reference:** See `QUICK_REFERENCE.md`
- **Implementation Details:** See `IMPLEMENTATION_COMPLETE.md`
- **Security Setup:** See `SECURITY_SETUP.md`
- **Code Quality:** Run `npm run lint`
- **Tests:** Run `npm test`

---

**🎉 You're ready to deploy!** Follow the quick start or production deployment steps above.
