#!/bin/bash
# =============================================================================
# Laravel Docker Startup Script
# =============================================================================
# This script runs when the container starts and handles:
#   1. Validating required environment variables
#   2. Setting up Laravel Passport OAuth keys
#   3. Caching Laravel configuration
#   4. Starting PHP-FPM and Nginx
# =============================================================================

set -e

echo "=== Laravel Docker Container Starting ==="

# =============================================================================
# 1. Validate Required Environment Variables
# =============================================================================
echo "=== Checking required environment variables ==="

if [ -z "$APP_KEY" ]; then
    echo "ERROR: APP_KEY is not set!"
    echo "Generate one with: php artisan key:generate --show"
    echo "Then set it in your deployment platform's environment variables."
    exit 1
fi

echo "✓ APP_KEY is configured"

# =============================================================================
# 2. Setup Laravel Passport OAuth Keys
# =============================================================================
echo "=== Setting up Passport OAuth keys ==="

STORAGE_DIR="/var/www/html/storage"
KEYS_CONFIGURED=false

# Create storage directory if it doesn't exist
mkdir -p "$STORAGE_DIR"

# OPTION 1: Check for keys in environment variables (recommended for cloud)
if [ -n "$PASSPORT_PRIVATE_KEY" ] && [ -n "$PASSPORT_PUBLIC_KEY" ]; then
    echo "Found Passport keys in environment variables"
    echo "$PASSPORT_PRIVATE_KEY" > "$STORAGE_DIR/oauth-private.key"
    echo "$PASSPORT_PUBLIC_KEY" > "$STORAGE_DIR/oauth-public.key"
    KEYS_CONFIGURED=true
fi

# OPTION 2: Check for keys in /etc/secrets (for platforms like Render)
if [ "$KEYS_CONFIGURED" = false ]; then
    if [ -f "/etc/secrets/oauth-private.key" ] && [ -f "/etc/secrets/oauth-public.key" ]; then
        echo "Found Passport keys in /etc/secrets"
        cp /etc/secrets/oauth-private.key "$STORAGE_DIR/oauth-private.key"
        cp /etc/secrets/oauth-public.key "$STORAGE_DIR/oauth-public.key"
        KEYS_CONFIGURED=true
    fi
fi

# OPTION 3: Check if keys already exist in storage (from previous runs or build)
if [ "$KEYS_CONFIGURED" = false ]; then
    if [ -f "$STORAGE_DIR/oauth-private.key" ] && [ -f "$STORAGE_DIR/oauth-public.key" ]; then
        echo "Found existing Passport keys in storage"
        KEYS_CONFIGURED=true
    fi
fi

# Set proper permissions for OAuth keys
if [ "$KEYS_CONFIGURED" = true ]; then
    # Set strict permissions required by Passport
    chmod 600 "$STORAGE_DIR/oauth-private.key" 2>/dev/null || true
    chmod 600 "$STORAGE_DIR/oauth-public.key" 2>/dev/null || true
    chown www-data:www-data "$STORAGE_DIR/oauth-private.key" 2>/dev/null || true
    chown www-data:www-data "$STORAGE_DIR/oauth-public.key" 2>/dev/null || true
    echo "✓ Passport OAuth keys configured with proper permissions"
else
    echo "WARNING: Passport OAuth keys not found!"
    echo "Authentication will not work until you configure them."
    echo ""
    echo "Options to configure Passport keys:"
    echo "  1. Set PASSPORT_PRIVATE_KEY and PASSPORT_PUBLIC_KEY environment variables"
    echo "  2. Mount keys to /etc/secrets/oauth-private.key and /etc/secrets/oauth-public.key"
    echo ""
    echo "To generate keys locally: php artisan passport:keys"
fi

# =============================================================================
# 3. Ensure proper directory permissions
# =============================================================================
echo "=== Setting directory permissions ==="

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true

echo "✓ Directory permissions set"

# =============================================================================
# 4. Cache Laravel configuration for performance
# =============================================================================
echo "=== Caching Laravel configuration ==="

# Clear any existing cache first
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

# Cache configuration (skip if database not ready)
php artisan config:cache || echo "⚠ Config cache failed (database may not be ready)"
php artisan route:cache || echo "⚠ Route cache failed (continuing...)"
php artisan view:cache || echo "⚠ View cache failed (continuing...)"

echo "✓ Laravel configuration cached"

# =============================================================================
# 5. Start services
# =============================================================================
echo "=== Starting services ==="

# Start PHP-FPM in background
echo "Starting PHP-FPM..."
php-fpm -D

# Start Nginx in foreground (keeps container running)
echo "Starting Nginx..."
echo "=== Laravel container is ready! ==="
exec nginx -g "daemon off;"
