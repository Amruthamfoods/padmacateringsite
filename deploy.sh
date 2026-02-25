#!/bin/bash
set -e

cd /var/www/padma-react

echo "==> Pulling latest code..."
git pull origin master

echo "==> Building main site..."
cd main-site && npm install && npm run build && cd ..

echo "==> Building booking portal..."
cd booking-portal && npm install && npm run build && cd ..

echo "==> Installing server dependencies..."
cd server && npm install && cd ..

echo "==> Restarting server..."
pm2 restart padma-server || pm2 start server/index.js --name padma-server

echo ""
echo "Done! Site is live at port $(grep PORT server/.env 2>/dev/null | cut -d= -f2 || echo 3001)"
