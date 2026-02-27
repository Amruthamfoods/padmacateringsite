# Security & Quality Configuration

## GitHub Actions CI/CD (.github/workflows/security.yml)

Create or update: `.github/workflows/security.yml`

```yaml
name: Security & Quality Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: ESLint - Backend
        run: npx eslint server/**/*.js --max-warnings 0
        continue-on-error: true
      
      - name: ESLint - Frontend
        run: cd booking-portal && npx eslint src/**/*.jsx --max-warnings 0
        continue-on-error: true

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: SNYK Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        continue-on-error: true

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: padma_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/padma_test
        continue-on-error: true
```

## Deployment Checklist

Before deploying to production:

- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables validated (`.env` file present with all required vars)
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Security scan passed (`npm audit`, SNYK)
- [ ] ESLint passing (`npx eslint`)
- [ ] Tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] CORS configured correctly
- [ ] JWT_SECRET is 32+ characters
- [ ] Email credentials valid
- [ ] Rate limiters configured
- [ ] CSRF protection enabled
- [ ] Input validation active
- [ ] Error handling middleware installed

## Package.json Scripts to Add

```json
{
  "scripts": {
    "lint": "eslint server/**/*.js",
    "lint:fix": "eslint server/**/*.js --fix",
    "security-audit": "npm audit --audit-level=moderate",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:integration": "jest --testPathPattern=integration",
    "validate-env": "node -e \"require('./server/utils/envValidator.js')()\"",
    "db:migrate": "npx prisma migrate dev",
    "db:migrate:deploy": "npx prisma migrate deploy",
    "db:seed": "node server/prisma/seed.js",
    "server:dev": "node --watch server/index.js",
    "server:prod": "NODE_ENV=production node server/index.js"
  }
}
```

## Environment Variables Template (.env.example)

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/padma_catering

# JWT
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Email
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-specific-password

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173|http://localhost:5174

# Pricing Constants
STAFF_RATE_PER_PERSON=650
GST_RATE=0.05
PACKING_CHARGE_PERCENT=0.10
```

## Continue Setting Up:

1. Install new packages: `npm install --legacy-peer-deps`
2. Create `.github/workflows/security.yml` for CI/CD
3. Add scripts to server `package.json`
4. Generate database migration: `npx prisma migrate dev --name add_indexes`
5. Update booking portal `package.json` to include zustand dependency
