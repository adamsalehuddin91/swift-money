#!/bin/sh

# Fix permissions on persistent volumes (mounted as root)
if [ -d /app/storage/db ]; then
    chown -R www-data:www-data /app/storage/db
    chmod 775 /app/storage/db
    [ -f /app/storage/db/database.sqlite ] && chmod 666 /app/storage/db/database.sqlite
fi

if [ -d /app/storage/app/public/receipts ]; then
    chown -R www-data:www-data /app/storage/app/public/receipts
    chmod -R 775 /app/storage/app/public/receipts
fi

exec supervisord -c /etc/supervisord.conf
