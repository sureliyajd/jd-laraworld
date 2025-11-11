# Laravel Horizon Setup - Complete ✅

## Installation Summary

### 1. ✅ Laravel Horizon Package
- **Status**: Installed via Composer
- **Version**: v5.39.0
- **Command**: `composer require laravel/horizon`

### 2. ✅ Horizon Assets Published
- **Status**: Configuration and service provider published
- **Command**: `php artisan horizon:install`
- **Files Created**:
  - `config/horizon.php`
  - `app/Providers/HorizonServiceProvider.php`

### 3. ✅ Redis PHP Client
- **Status**: Installed via Composer
- **Client**: Predis (v3.2.0) - Pure PHP Redis client
- **Installation**: `composer require predis/predis`
- **Configuration**: Set in `config/database.php` as `REDIS_CLIENT=predis`
- **Advantage**: No PHP extension required, works out of the box ✅

### 4. ✅ Redis Server
- **Status**: Installed and running
- **Location**: `/opt/homebrew/bin/redis-server`
- **Connection**: Working ✅
- **Test**: `redis-cli ping` returns `PONG`

### 5. ✅ Horizon Configuration
- **Path**: `/horizon` (configurable via `HORIZON_PATH`)
- **Middleware**: `web`, `HorizonAuth` (custom Bearer token auth)
- **Redis Connection**: Configured to use `default` Redis connection
- **Queue Connection**: Redis (required for Horizon)

### 6. ✅ Authentication Setup
- **Middleware**: `app/Http/Middleware/HorizonAuth.php`
  - Converts Bearer tokens to session authentication
  - Validates Passport tokens from query parameter or Authorization header
  - Creates session for authenticated users
- **Gate**: `HorizonServiceProvider::gate()`
  - Allows all authenticated users (customizable)
  - Can be restricted by role/permission in production

### 7. ✅ Frontend Integration
- **Component**: `lara-world-showcase/src/pages/LogHorizon.tsx`
- **Features**:
  - Dashboard tab (shown when Horizon is installed)
  - Iframe embedding with authentication token
  - Automatic token injection from localStorage
  - Responsive layout

---

## What We Set Up (High-Level)

- Installed Laravel Horizon and its config/provider files.
- Installed and configured Redis with the Predis PHP client.
- Wired Horizon to use the `redis` queue connection and `default` Redis connection.
- Added a custom `HorizonAuth` middleware to bridge API Bearer tokens (Laravel Passport) to web sessions for Horizon’s UI.
- Allowed authenticated users via `HorizonServiceProvider::gate()`.
- Embedded the Horizon dashboard in the frontend with an iframe and token auto-injection.

---

## Step-by-Step: Full Setup We Performed

1) Install Horizon
```bash
cd backend
composer require laravel/horizon
php artisan horizon:install
```

This generated:
- `config/horizon.php`
- `app/Providers/HorizonServiceProvider.php` (remember to register in `config/app.php` if not auto-registered)

2) Install Redis client (Predis)
```bash
composer require predis/predis
```
Then ensure in `config/database.php`:
- `'client' => env('REDIS_CLIENT', 'predis')`
And in `.env` (development):
```env
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null
```

3) Ensure Redis server is installed and running (macOS/Homebrew)
```bash
brew install redis
brew services start redis
redis-cli ping   # should return PONG
```

4) Configure queues
- Keep default queue as `database` or switch all to `redis`. For full Horizon monitoring:
```env
QUEUE_CONNECTION=redis
```

5) Configure Horizon
- `config/horizon.php`:
  - Path: `horizon`
  - Middleware: `['web', \App\Http\Middleware\HorizonAuth::class]`
  - Redis connection: `default`
  - Environments: local uses 3 processes, production uses 10 (customizable)

6) Add `HorizonAuth` middleware
- File: `app/Http/Middleware/HorizonAuth.php`
- Purpose: accept `Authorization: Bearer <token>` or `?token=<token>` (Laravel Passport), validate it, and create a web session so Horizon recognizes the user.

7) Gate authorization
- In `app/Providers/HorizonServiceProvider.php`, a `gate()` method allows authenticated users in development. For production, restrict based on roles/permissions/emails.

8) Frontend integration (optional)
- `LogHorizon.tsx` embeds an iframe pointing to `{API_BASE}/horizon?token={access_token}` pulling token from `localStorage`.

9) Cache/config refresh if needed
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

10) Run Horizon
```bash
php artisan horizon
```

---

## Configuration Files

### Backend Configuration

#### `config/horizon.php`
- **Path**: `/horizon`
- **Middleware**: `['web', \App\Http\Middleware\HorizonAuth::class]`
- **Redis Connection**: `default`
- **Queue Connection**: `redis`
- **Environments**: `local` (3 processes), `production` (10 processes)

#### `app/Providers/HorizonServiceProvider.php`
- **Gate**: Allows authenticated users
- **Customizable**: Can restrict by email, role, or permission

#### `app/Http/Middleware/HorizonAuth.php`
- **Purpose**: Bridge Bearer token auth to session auth
- **Token Sources**: 
  - Authorization header: `Bearer {token}`
  - Query parameter: `?token={token}`
- **Validation**: Checks `oauth_access_tokens` table
- **Session**: Creates web session for Horizon

#### `config/database.php`
- **Redis Client**: `predis` (configured as default)
- **Client Selection**: `env('REDIS_CLIENT', 'predis')`
- **Note**: Predis is a pure PHP implementation, no extension required

### Frontend Configuration

#### `lara-world-showcase/src/pages/LogHorizon.tsx`
- **Dashboard URL**: `{API_BASE}/horizon?token={access_token}`
- **Token Source**: `localStorage.getItem('access_token')`
- **Display**: Conditional based on Horizon installation status

---

## Usage

### Starting Horizon

```bash
# Start Horizon in foreground
php artisan horizon

# Start Horizon in background (production)
php artisan horizon &

# Check Horizon status
php artisan horizon:status

# Pause Horizon
php artisan horizon:pause

# Continue Horizon
php artisan horizon:continue

# Terminate Horizon
php artisan horizon:terminate
```

### Accessing Horizon Dashboard

1. **Via Browser (Direct)**:
   - URL: `http://localhost:8000/horizon`
   - Requires session authentication (login via web routes first)

2. **Via Frontend (Iframe)**:
   - Navigate to Log Horizon page
   - Click on "Dashboard" tab
   - Horizon loads in iframe with Bearer token authentication

---

## Local Development Guide (How to Use Locally)

1) Start Redis
```bash
brew services start redis
redis-cli ping
```

2) Start Laravel backend
```bash
cd backend
php artisan serve  # defaults to http://127.0.0.1:8000
```

3) Ensure database and migrations are ready
```bash
php artisan migrate
```

4) Ensure queue connection is set (recommended)
```env
QUEUE_CONNECTION=redis
```

5) Start Horizon in a separate terminal
```bash
php artisan horizon
```

6) Log in and access Horizon
- Visit `http://127.0.0.1:8000/login` (or your auth flow) to obtain a token or session.
- Direct: open `http://127.0.0.1:8000/horizon`.
- Frontend iframe: open the Log Horizon page; it injects `?token=<access_token>` automatically if present.

7) Dispatch a test job (optional)
```php
// tinker example
php artisan tinker
>>> \App\Jobs\SendEmailJob::dispatch([...]);
```
Watch it process in the Horizon dashboard.

---

### Testing Redis Connection

```bash
# Test Redis server
redis-cli ping

# Test Redis in Laravel
php artisan tinker
>>> Redis::ping()
```

---

## Environment Variables

### Required for Horizon

```env
# Redis Configuration (usually defaults work)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
REDIS_CLIENT=predis  # Use Predis (pure PHP) or phpredis (extension required)

# Queue Configuration (for Horizon)
QUEUE_CONNECTION=redis  # Optional: Horizon uses Redis regardless

# Horizon Configuration (optional)
HORIZON_PATH=horizon
HORIZON_NAME=your-app-name
HORIZON_DOMAIN=null
```

### Redis Client Options

- **Predis** (Recommended for development):
  - Pure PHP implementation
  - No PHP extension required
  - Easy to install: `composer require predis/predis`
  - Set `REDIS_CLIENT=predis` in `.env` or `config/database.php`

- **phpredis** (Optional, for production):
  - PHP extension (faster, lower memory)
  - Requires system-level installation
  - Installation: `brew install shivammathur/extensions/phpredis@8.2`
  - Set `REDIS_CLIENT=phpredis` in `.env`

### Optional: Session Configuration for Iframe (Production)

If embedding Horizon in iframe on a different domain (HTTPS required):

```env
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=true
```

---

## Queue Configuration

### Current Setup
- **Default Queue**: `database` (can remain)
- **Horizon Queue**: `redis` (configured in `config/horizon.php`)
- **Note**: Horizon requires Redis, but your app can use database queues for non-Horizon jobs

### Using Redis for All Queues (Recommended)

Update `.env`:
```env
QUEUE_CONNECTION=redis
```

This enables:
- Better performance
- Horizon monitoring for all jobs
- Real-time queue metrics

---

## Production/Cloud Deployment Guide

There are many viable topologies. Below is a simple, secure, and reliable approach you can adapt.

### Prerequisites
- A Linux VM or container with PHP, Composer, and web server (Nginx/Apache).
- Managed Redis (recommended) or self-hosted Redis reachable by the app.
- HTTPS termination (via Nginx/ALB/Cloudflare).
- Environment variables supplied via secrets manager or `.env`.

### 1) Build and Deploy App
```bash
# On your build machine/CI:
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
Copy the code and `vendor/` to the server or build a container image.

### 2) Configure Environment
Production `.env` (example):
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

REDIS_CLIENT=phpredis   # or predis if you prefer
REDIS_HOST=your-managed-redis-host
REDIS_PASSWORD=your-redis-password   # if required
REDIS_PORT=6379

QUEUE_CONNECTION=redis
HORIZON_PATH=horizon
SESSION_DRIVER=redis     # optional, recommended for scale
SESSION_SAME_SITE=lax    # or none (with HTTPS only) if cross-site iframe needed
SESSION_SECURE_COOKIE=true
```

### 3) Web Server
Nginx example snippet:
```nginx
location / {
    try_files $uri /index.php?$query_string;
}

location ~ \.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/run/php/php-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```
Ensure HTTPS is enabled and HSTS if appropriate.

### 4) Run Horizon as a Service
Use systemd (recommended on Linux) to keep Horizon always running.

Create `/etc/systemd/system/laravel-horizon.service`:
```
[Unit]
Description=Laravel Horizon
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/current/artisan horizon
ExecStop=/usr/bin/php /var/www/current/artisan horizon:terminate
WorkingDirectory=/var/www/current
StandardOutput=append:/var/log/horizon.log
StandardError=append:/var/log/horizon-error.log
Environment=APP_ENV=production

[Install]
WantedBy=multi-user.target
```
Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable laravel-horizon
sudo systemctl start laravel-horizon
sudo systemctl status laravel-horizon
```

Alternatively: Supervisor or a process runner in your container orchestrator (ECS/Kubernetes).

### 5) Secure Horizon Access
- Restrict `gate()` to specific users/roles:
```php
return $user && $user->hasRole('super_admin');
```
- Optionally IP restrict via Nginx for `/horizon`.
- Require HTTPS, secure cookies, and short-lived tokens. Prefer SSO in enterprise contexts.

### 6) Scaling Workers
- Adjust `config/horizon.php` per environment for process counts and queues.
- After changes: `php artisan horizon:terminate` (systemd will restart with new config).
- For containers: use a separate Horizon worker deployment with desired replicas.

### 7) Observability
- Send Laravel logs to a central system.
- Monitor Redis and queue latency via Horizon UI and external metrics.
- Health-check endpoint for app; use `horizon:status` in ops checks.

---

## Security Considerations

### Authentication
- ✅ Bearer token validation
- ✅ Session-based authentication for Horizon
- ✅ Gate authorization (customizable)
- ⚠️ **Production**: Restrict access to specific users/roles

### Recommendations for Production

1. **Restrict Horizon Access**:
   ```php
   // In HorizonServiceProvider::gate()
   return $user && $user->hasRole('super_admin');
   ```

2. **Use HTTPS**: Required for secure cookie transmission in iframes

3. **Session Security**: Configure `SESSION_SAME_SITE` and `SESSION_SECURE_COOKIE`

4. **Token Expiration**: Ensure tokens expire appropriately

---

## Troubleshooting

### Issue: "Class Redis not found"
- **Solution**: Install Predis package (Recommended)
  ```bash
  composer require predis/predis
  ```
  Then ensure `config/database.php` has `'client' => env('REDIS_CLIENT', 'predis')`
  
  **Alternative**: If you prefer phpredis extension:
  ```bash
  brew install shivammathur/extensions/phpredis@8.2
  ```
  Then set `REDIS_CLIENT=phpredis` in `.env`

### Issue: "Redis connection refused"
- **Solution**: Start Redis server
  ```bash
  brew services start redis
  # or
  redis-server
  ```

### Issue: Horizon dashboard shows 403
- **Solution**: Check authentication middleware and gate configuration
- Verify token is valid and user is authenticated

### Issue: Iframe not loading Horizon
- **Solution**: 
  - Check browser console for errors
  - Verify token is being passed correctly
  - Check CORS and session configuration
  - For cross-origin: Configure session `same_site` and `secure` cookies

### Issue: Horizon not updating after config changes
- **Solution**: Send the terminate signal to reload:
  ```bash
  php artisan horizon:terminate
  ```
  If using systemd, the service restarts automatically.

### Issue: Jobs stuck in pending
- **Solution**:
  - Confirm `QUEUE_CONNECTION=redis`
  - Redis reachable from app workers
  - Horizon is running and processes are not paused (`horizon:continue`)
  - Check `failed_jobs` table for errors and fix root cause

---

## Verification Checklist

- Can run `redis-cli ping` and get `PONG`.
- `php artisan horizon` starts without errors.
- Visiting `/horizon` shows dashboard after authentication.
- A test job dispatches and completes; visible in Horizon.
- In production, `systemctl status laravel-horizon` is `active (running)`.
- Security gate restricts access appropriately in production.

## Next Steps

1. ✅ **Start Horizon**: `php artisan horizon`
2. ✅ **Test Dashboard**: Access `/horizon` in browser
3. ✅ **Test Frontend**: Navigate to Log Horizon page
4. ✅ **Create Test Job**: Dispatch a job to test queue processing
5. ✅ **Monitor**: Watch jobs process in Horizon dashboard

## Additional Resources

- [Laravel Horizon Documentation](https://laravel.com/docs/horizon)
- [Redis Documentation](https://redis.io/documentation)
- [Laravel Queue Documentation](https://laravel.com/docs/queues)

---

**Setup Completed**: All components installed and configured ✅
**Status**: Ready for use ✅
**Redis Client**: Predis (v3.2.0) - Pure PHP implementation ✅
**Last Updated**: 2025-01-27

