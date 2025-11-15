# Simple Dockerfile for Laravel Backend
# This connects to your local MySQL database on your MacBook

# Use PHP 8.2 with FPM (FastCGI Process Manager)
# FPM is needed when using Nginx as web server
FROM php:8.2-fpm

# Set working directory inside container
WORKDIR /var/www/html

# Install system dependencies and PHP extensions needed for Laravel
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
    && docker-php-ext-install \
    # Install PHP extensions
    pdo \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer (Laravel's dependency manager)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . /var/www/html

# Install PHP dependencies (vendor folder)
# For development, we keep dev dependencies. Use --no-dev for production
RUN composer install --optimize-autoloader

# Clear stale Laravel cache files (package discovery cache)
# This prevents errors from packages that were removed but still cached
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php || true

# Set proper permissions for Laravel
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Expose port 9000 (PHP-FPM default port)
EXPOSE 9000

# Start PHP-FPM server
CMD ["php-fpm"]
