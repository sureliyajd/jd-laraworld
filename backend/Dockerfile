# syntax=docker/dockerfile:1.7
#
# Multi-stage Dockerfile for Laravel (PHP-FPM) with Composer vendor build
#

FROM composer:2 AS vendor
WORKDIR /app

# Leverage caching by copying only dependency files first
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-scripts --no-progress

# Copy full application to run scripts and optimize autoload
COPY . .
RUN composer dump-autoload --optimize


FROM php:8.2-fpm-alpine AS runtime
WORKDIR /var/www/html

# System deps required for common PHP extensions
RUN apk add --no-cache \
  bash \
  icu-dev \
  oniguruma-dev \
  libzip-dev \
  zlib-dev \
  sqlite-libs \
  git

# PHP extensions (pdo_mysql for MySQL; pdo_sqlite for SQLite used locally)
RUN docker-php-ext-install pdo pdo_mysql pdo_sqlite intl mbstring zip

# Opcache defaults tuned for production
ENV PHP_OPCACHE_VALIDATE_TIMESTAMPS=0
ENV PHP_OPCACHE_MAX_ACCELERATED_FILES=16229
ENV PHP_OPCACHE_MEMORY_CONSUMPTION=128
ENV PHP_OPCACHE_INTERNED_STRINGS_BUFFER=16

# Copy application with vendor from builder
COPY --from=vendor /app /var/www/html

# Ensure storage and cache are writable by www-data
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm", "-F"]


