# Production Environment Variables Guide

Complete reference for environment variables needed for production deployment on Render.com.

## 🔑 Required Variables

### Application Configuration

```bash
# Application Name
APP_NAME="JD LaraWorld"

# Environment (MUST be 'production' for production)
APP_ENV=production

# Debug Mode (MUST be 'false' for production)
APP_DEBUG=false

# Application URL (Update after deployment)
APP_URL=https://your-service-name.onrender.com

# Application Key (Generate a new one for production!)
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
```

**How to generate APP_KEY:**
```bash
cd backend
php artisan key:generate --show
# Copy the output
```

---

## 🗄️ Database Configuration

### MySQL/MariaDB

```bash
DB_CONNECTION=mysql
DB_HOST=your-database-host.com
DB_PORT=3306
DB_DATABASE=jd_laraworld_prod
DB_USERNAME=your_db_username
DB_PASSWORD=your_secure_password

# Optional: For SSL connections
MYSQL_ATTR_SSL_CA=/path/to/ca-cert.pem
```

### PostgreSQL (if using Render's PostgreSQL)

```bash
DB_CONNECTION=pgsql
DB_HOST=dpg-xxxxx-a.render.com
DB_PORT=5432
DB_DATABASE=jd_laraworld_xxxx
DB_USERNAME=jd_laraworld_user
DB_PASSWORD=your_password
```

**Example Render PostgreSQL connection string:**
```
postgres://jd_laraworld_user:password@dpg-xxxxx-a.render.com:5432/jd_laraworld_xxxx
```

---

## 📧 Mail Configuration

### SMTP (Most Common)

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io  # or smtp.gmail.com, sendgrid, etc.
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls  # or 'ssl' for port 465
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="JD LaraWorld"
```

### Mailgun

```bash
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-secret
MAILGUN_ENDPOINT=api.mailgun.net
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="JD LaraWorld"
```

### AWS SES

```bash
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="JD LaraWorld"
```

### Postmark

```bash
MAIL_MAILER=postmark
POSTMARK_TOKEN=your-postmark-token
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="JD LaraWorld"
```

### Resend

```bash
MAIL_MAILER=resend
RESEND_KEY=your-resend-key
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="JD LaraWorld"
```

---

## 💾 Cache & Session Configuration

### File-based (Default, Works on Render)

```bash
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

### Redis (If you have Redis service)

```bash
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
REDIS_PORT=6379
REDIS_DB=0
```

---

## 📝 Logging Configuration

```bash
LOG_CHANNEL=stack
LOG_LEVEL=error  # Use 'error' for production, 'debug' only for troubleshooting
LOG_DEPRECATIONS_CHANNEL=null
```

**Log Levels:**
- `debug` - Detailed debug information (NOT for production!)
- `info` - Informational messages
- `notice` - Normal but significant events
- `warning` - Warning messages
- `error` - Error messages (recommended for production)
- `critical` - Critical conditions
- `alert` - Action must be taken immediately
- `emergency` - System is unusable

---

## 🔐 Laravel Passport (OAuth)

If using Laravel Passport:

```bash
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
```

Or generate keys:
```bash
php artisan passport:keys
```

---

## 🌐 Broadcasting (Pusher/WebSockets)

If using Pusher:

```bash
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1
```

---

## 📊 Horizon (Queue Dashboard)

If using Laravel Horizon:

```bash
HORIZON_BALANCE=simple
HORIZON_MAX_PROCESSES=10
HORIZON_MEMORY=128
```

---

## 🔄 Comparison: Local vs Production

| Variable | Local Development | Production (Render) |
|----------|------------------|-------------------|
| `APP_ENV` | `local` | `production` |
| `APP_DEBUG` | `true` | `false` |
| `APP_URL` | `http://localhost:8000` | `https://your-app.onrender.com` |
| `DB_HOST` | `host.docker.internal` | Your production DB host |
| `DB_DATABASE` | `jd-laraworld` | `jd_laraworld_prod` |
| `LOG_LEVEL` | `debug` | `error` |
| `CACHE_DRIVER` | `file` | `file` or `redis` |
| `QUEUE_CONNECTION` | `sync` | `sync` or `redis` |

---

## 🛡️ Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_ENV=production` in production
- [ ] `APP_KEY` is set and unique (never reuse!)
- [ ] Database passwords are strong and unique
- [ ] SMTP credentials are secure
- [ ] No sensitive data in Git repository
- [ ] Use Render Secrets for passwords
- [ ] `LOG_LEVEL=error` (not `debug`)
- [ ] SSL/TLS enabled for database connections (if available)

---

## 📋 Quick Setup Template

Copy this template and fill in your values:

```bash
# Application
APP_NAME="JD LaraWorld"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-service-name.onrender.com
APP_KEY=base64:YOUR_KEY_HERE

# Database
DB_CONNECTION=mysql
DB_HOST=your-db-host.com
DB_PORT=3306
DB_DATABASE=jd_laraworld_prod
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=your_smtp_user
MAIL_PASSWORD=your_smtp_pass
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="JD LaraWorld"

# Cache & Session
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
```

---

## 🧪 Testing Environment Variables

After setting variables in Render:

1. Go to your service dashboard
2. Click **"Shell"** tab
3. Run:

```bash
# Check if variables are loaded
php artisan tinker
>>> env('APP_ENV')
=> "production"
>>> env('DB_HOST')
=> "your-db-host.com"
```

---

## 📚 Additional Resources

- [Laravel Configuration](https://laravel.com/docs/configuration)
- [Environment Variables in Laravel](https://laravel.com/docs/configuration#environment-configuration)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

**Remember:** Never commit `.env` files to Git! Always use environment variables in your hosting platform.

