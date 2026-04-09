#!/bin/sh

# Fix permissions on persistent volumes (mounted as root)
if [ -d /app/storage/db ]; then
    chown -R www-data:www-data /app/storage/db
    chmod 775 /app/storage/db
    [ -f /app/storage/db/database.sqlite ] && chmod 666 /app/storage/db/database.sqlite
fi

# Private receipts storage (not public)
if [ -d /app/storage/app/receipts ]; then
    chown -R www-data:www-data /app/storage/app/receipts
    chmod -R 775 /app/storage/app/receipts
fi

# Backup SQLite before migration (keep last 7 copies)
if [ -f /app/storage/db/database.sqlite ]; then
    BACKUP_DIR=/app/storage/db/backups
    mkdir -p $BACKUP_DIR
    cp /app/storage/db/database.sqlite "$BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sqlite"
    # Keep only last 7 backups
    ls -t $BACKUP_DIR/*.sqlite 2>/dev/null | tail -n +8 | xargs rm -f
fi

# Run migrations automatically on every deploy
php artisan migrate --force

exec supervisord -c /etc/supervisord.conf
