# =============================================================================
# Laravel Production Dockerfile
# =============================================================================
# This Dockerfile creates a production-ready Laravel container with:
#   - PHP 8.2 with FPM (FastCGI Process Manager)
#   - Nginx web server (runs on port 80)
#   - All required PHP extensions for Laravel
#
# IMPORTANT: Before deploying, you must configure:
#   1. Environment variables (see REQUIRED ENVIRONMENT VARIABLES below)
#   2. Laravel Passport OAuth keys (see PASSPORT KEYS SETUP below)
#
# =============================================================================
# REQUIRED ENVIRONMENT VARIABLES
# =============================================================================
# These must be set in your deployment platform (Render, AWS, DigitalOcean, etc.):
#
#   APP_KEY           - Laravel application key (run: php artisan key:generate --show)
#   APP_ENV           - Set to "production"
#   APP_DEBUG         - Set to "false"
#   APP_URL           - Your production URL (e.g., https://api.yourdomain.com)
#
#   DB_CONNECTION     - Database driver (mysql, pgsql, sqlite)
#   DB_HOST           - Database host
#   DB_PORT           - Database port (3306 for MySQL, 5432 for PostgreSQL)
#   DB_DATABASE       - Database name
#   DB_USERNAME       - Database username
#   DB_PASSWORD       - Database password
#
# Optional (for real-time features):
#   PUSHER_APP_ID, PUSHER_APP_KEY, PUSHER_APP_SECRET, PUSHER_APP_CLUSTER
#
# =============================================================================
# PASSPORT KEYS SETUP
# =============================================================================
# Laravel Passport requires OAuth encryption keys for authentication.
# You have two options:
#
# OPTION 1: Environment Variables (Recommended for cloud platforms)
#   Set these environment variables with your key contents:
#     PASSPORT_PRIVATE_KEY - Contents of oauth-private.key
#     PASSPORT_PUBLIC_KEY  - Contents of oauth-public.key
#
# OPTION 2: Secret Files (For platforms supporting secret files like Render)
#   Mount your keys to these paths:
#     /etc/secrets/oauth-private.key
#     /etc/secrets/oauth-public.key
#   The startup script will automatically copy them to the correct location.
#
# To generate new Passport keys locally:
#   php artisan passport:keys
#   This creates: storage/oauth-private.key and storage/oauth-public.key
#
# =============================================================================
# FIRST-TIME DEPLOYMENT STEPS
# =============================================================================
# 1. Generate APP_KEY locally: php artisan key:generate --show
# 2. Generate Passport keys locally: php artisan passport:keys
# 3. Set all required environment variables in your deployment platform
# 4. Upload Passport keys as secret files OR set as environment variables
# 5. Deploy the container
# 6. Run migrations: php artisan migrate --force
# 7. Run seeders (if needed): php artisan db:seed --force
# 8. Create Passport client: php artisan passport:client --personal --name="Personal Access Client"
#
# =============================================================================

FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www/html

# =============================================================================
# Install system dependencies and PHP extensions
# =============================================================================
RUN apt-get update && apt-get install -y \
    # Basic tools
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    # MySQL client libraries (needed for pdo_mysql extension)
    default-mysql-client \
    libpq-dev \
    # Nginx web server
    nginx \
    # Supervisor for process management (optional but recommended)
    supervisor \
    && docker-php-ext-install \
    # PHP extensions required by Laravel
    pdo \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# =============================================================================
# Install Composer
# =============================================================================
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# =============================================================================
# Copy application files
# =============================================================================
COPY . /var/www/html

# =============================================================================
# Install PHP dependencies (production mode)
# =============================================================================
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Clear stale Laravel cache files (prevents errors from removed packages)
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php || true

# =============================================================================
# Copy Nginx configuration
# =============================================================================
COPY nginx-prod.conf /etc/nginx/sites-available/default

# =============================================================================
# Create required directories and set permissions
# =============================================================================
RUN mkdir -p /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/logs \
    /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# =============================================================================
# Copy and configure startup script
# =============================================================================
COPY docker-start.sh /start.sh
RUN chmod +x /start.sh

# =============================================================================
# Expose port 80 (Nginx)
# =============================================================================
EXPOSE 80

# =============================================================================
# Health check endpoint
# =============================================================================
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/up || exit 1

# =============================================================================
# Start the application
# =============================================================================
CMD ["/start.sh"]
