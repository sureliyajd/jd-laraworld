#!/bin/bash
set -e

# NOTE: APP_KEY MUST be provided via environment variable in Render.
if [ -z "$APP_KEY" ]; then
    echo "ERROR: APP_KEY is not set. Please configure APP_KEY in Render environment variables."
fi

echo "=== Checking for Narwhal keys in /etc/secrets ==="

# The folder in your Laravel app where you expect your keys
LARAVEL_KEY_DIR="/var/www/html/storage"

mkdir -p $LARAVEL_KEY_DIR

# Copy private key
if [ -f "/etc/secrets/oauth-private.key" ]; then
    echo "Found oauth-private.key → copying to storage..."
    cp /etc/secrets/oauth-private.key $LARAVEL_KEY_DIR/private.pem
else
    echo "WARNING: oauth-private.key not found in /etc/secrets"
fi

# Copy public key
if [ -f "/etc/secrets/oauth-public.key" ]; then
    echo "Found oauth-public.key → copying to storage..."
    cp /etc/secrets/oauth-public.key $LARAVEL_KEY_DIR/public.pem
else
    echo "WARNING: oauth-public.key not found in /etc/secrets"
fi

# Fix ownership & permissions
chown -R www-data:www-data $LARAVEL_KEY_DIR
chmod 600 $LARAVEL_KEY_DIR/private.pem 2>/dev/null || true
chmod 644 $LARAVEL_KEY_DIR/public.pem 2>/dev/null || true

echo "=== Narwhal keys setup complete ==="

# Cache configuration for performance (skip if database not ready)
php artisan config:cache || echo "Config cache failed, continuing..."
php artisan route:cache || echo "Route cache failed, continuing..."
php artisan view:cache || echo "View cache failed, continuing..."

# Ensure storage and cache directories (and any log files) are writable by PHP-FPM user
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
exec nginx -g "daemon off;"

