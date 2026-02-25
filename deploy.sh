#!/bin/bash
set -e

REPO_DIR="/var/www/padma-react"
WEB_ROOT="/var/www/html"          # adjust if your Hostinger web root differs
BOOKING_DIR="$WEB_ROOT/booking"

cd "$REPO_DIR"

echo "==> Pulling latest code..."
git pull origin master

echo "==> Building main site..."
cd main-site
npm install --legacy-peer-deps
npm run build
cd ..

echo "==> Building booking portal..."
cd booking-portal
npm install --legacy-peer-deps
npm run build
cd ..

echo "==> Installing server dependencies..."
cd server
npm install --legacy-peer-deps
cd ..

echo "==> Deploying main site to web root..."
cp -r main-site/dist/. "$WEB_ROOT/"

echo "==> Deploying booking portal..."
mkdir -p "$BOOKING_DIR"
cp -r booking-portal/dist/. "$BOOKING_DIR/"

echo "==> Restarting server..."
pm2 restart padma-server || pm2 start server/index.js --name padma-server

echo ""
echo "Done! Site is live."
