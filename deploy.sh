#!/bin/bash
set -e

SITE_DIR="/var/www/padma-react"
BACKUP_DIR="/var/www/padma-backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="$BACKUP_DIR/padma-$TIMESTAMP.tar.gz"
DB_DUMP="$BACKUP_DIR/padma-db-$TIMESTAMP.sql"

echo "==> Creating backup..."
mkdir -p "$BACKUP_DIR"

# Dump PostgreSQL database
DB_NAME=$(grep DATABASE_URL "$SITE_DIR/server/.env" 2>/dev/null | sed 's|.*\/||' | tr -d '"' | tr -d "'" | tr -d '\r' | cut -d'?' -f1)
if [ -n "$DB_NAME" ]; then
  echo "    Dumping database: $DB_NAME"
  pg_dump -U postgres "$DB_NAME" > "$DB_DUMP" 2>/dev/null && echo "    DB dump OK" || echo "    WARNING: DB dump failed, continuing..."
else
  echo "    WARNING: Could not read DB name from .env"
fi

# Create tar archive of site files + DB dump
tar -czf "$BACKUP_FILE" \
  --exclude="$SITE_DIR/.git" \
  --exclude="$SITE_DIR/node_modules" \
  --exclude="$SITE_DIR/main-site/node_modules" \
  --exclude="$SITE_DIR/booking-portal/node_modules" \
  --exclude="$SITE_DIR/server/node_modules" \
  "$SITE_DIR" \
  $([ -f "$DB_DUMP" ] && echo "$DB_DUMP") 2>/dev/null || true
[ -f "$DB_DUMP" ] && rm -f "$DB_DUMP"
echo "    Saved: $BACKUP_FILE"

# Keep only last 3 backups — delete oldest if more than 3 exist
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/padma-*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 3 ]; then
  OLDEST=$(ls -1t "$BACKUP_DIR"/padma-*.tar.gz | tail -1)
  echo "    Removing old backup: $OLDEST"
  rm -f "$OLDEST"
fi

cd "$SITE_DIR"

echo "==> Pulling latest code..."
git pull origin master

echo "==> Building main site..."
(cd main-site && npm install && npm run build)

echo "==> Building booking portal..."
(cd booking-portal && npm install && npm run build)
cp -r booking-portal/dist/. /var/www/booking/
echo "    Copied booking portal to /var/www/booking"

echo "==> Installing server dependencies..."
(cd server && npm install)

echo "==> Restarting server..."
pm2 restart padma-server || pm2 start server/index.js --name padma-server

echo ""
echo "Done! Site is live at port $(grep PORT server/.env 2>/dev/null | cut -d= -f2 || echo 3001)"
