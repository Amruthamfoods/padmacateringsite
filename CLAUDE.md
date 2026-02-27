# Padma Catering — Claude Agent Roles

## Project Overview
Full-stack catering booking platform.
- **Main site** → `src/` · Vite · `http://localhost:5173/padmacateringsite/`
- **Booking portal** → `booking-portal/src/` · Vite · `http://localhost:5174/booking/`
- **Backend** → `server/` · Express + Prisma + PostgreSQL · `http://localhost:3001`
- **Admin panel** → `http://localhost:5173/padmacateringsite/admin/`
- **Remote server** → `ssh root@187.77.186.38` · deploy with `bash deploy.sh`

---

## Agent Roles

### 🔧 BACKEND
**Owns:** `server/` — all backend logic, database, and API.

Responsibilities:
- Express routes (`server/routes/`)
- Prisma schema changes (`server/prisma/schema.prisma`)
- Database migrations (`npx prisma migrate dev`)
- Seeding data (`server/prisma/seed.js` or one-off scripts)
- Auth, middleware, validation
- Business logic (pricing, booking rules, coupons)

Do NOT touch: any `src/` or `booking-portal/src/` files.

---

### 🎨 FRONTEND
**Owns:** `src/` (main site + admin) and `booking-portal/src/` — all UI and UX.

Responsibilities:
- React pages and components
- CSS (`index.css`, `desktop.css`, `page-styles.css`)
- Routing (`App.jsx`)
- State management (Zustand stores)
- Admin panel UI (`src/pages/admin/`)
- Booking portal flow (`booking-portal/src/pages/`)
- API calls (`src/lib/api.js`, `booking-portal/src/lib/api.js`)

Do NOT touch: `server/` files.

---

### 👤 CUSTEXP
**Owns:** Customer journey — flow testing, copy, messaging, and experience quality.

Responsibilities:
- Test end-to-end booking flow as a customer
- Review page copy, labels, error messages, and toast notifications
- Validate that steps make sense in order (packages → diet → menu → details → summary → payment)
- Check mobile vs desktop experience
- Review pricing display, confirmation messages, success screens
- Suggest improvements to confusing steps or missing information

Do NOT modify code directly — raise findings as clear descriptions for FRONTEND or BACKEND agents to act on.

---

### 🚀 DEVOPS
**Owns:** Infrastructure, deployment, and server management.

Responsibilities:
- SSH into production server (`ssh root@187.77.186.38`)
- Deploy via `bash deploy.sh`
- PM2 process management (`pm2 status`, `pm2 restart padma-server`)
- Nginx config
- Environment variables (`.env`)
- Build scripts (`vite build`)
- Domain/SSL setup (booking.padmacatering.com)

Do NOT touch: application code. Only deployment and server config.

---

## Key File Map

| Area | Path |
|---|---|
| Backend entry | `server/index.js` |
| DB schema | `server/prisma/schema.prisma` |
| API routes | `server/routes/` |
| Main site pages | `src/pages/` |
| Admin pages | `src/pages/admin/` |
| Booking portal pages | `booking-portal/src/pages/` |
| Booking portal components | `booking-portal/src/components/` |
| Main site CSS | `src/index.css`, `src/desktop.css` |
| Booking portal CSS | `booking-portal/src/index.css`, `booking-portal/src/desktop.css` |
| Auth store | `src/store/authStore.js` |
| API client (main) | `src/lib/api.js` |
| API client (portal) | `booking-portal/src/lib/api.js` |

## Booking Flow
```
/booking/packages → /booking/diet → /booking/menu/:pkgId
→ /booking/details → /booking/summary → /booking/payment → /booking/success
```

## Admin Credentials
- Email: `admin@padmacatering.com`
- Password: `admin123`

## Stack
- Frontend: React 18, Vite, Zustand, React Router v7, React Hot Toast, date-fns
- Backend: Node.js, Express, Prisma ORM, PostgreSQL, JWT, bcryptjs
- Styling: Custom CSS variables (dark gold theme for admin/main, light red theme for booking portal)
