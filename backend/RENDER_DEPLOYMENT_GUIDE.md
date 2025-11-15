# 🚀 Render.com Deployment Guide

Complete guide to deploy your Laravel application to Render.com as a web service.

## 📋 Prerequisites

1. ✅ Your code is in a Git repository (GitHub, GitLab, or Bitbucket)
2. ✅ You have a Render.com account (free tier available)
3. ✅ Your database is deployed somewhere (or use Render's database service)
4. ✅ You understand your database connection details

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Make sure your code is pushed to Git:

```bash
# Check your current branch
git branch

# Make sure all changes are committed
git status

# Push to your repository
git push origin main
```

### Step 2: Create Render.com Account & New Web Service

1. Go to [Render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository (GitHub/GitLab/Bitbucket)
4. Select your repository: `jd-laraworld`

### Step 3: Configure the Web Service

#### Basic Settings:
- **Name**: `jd-laraworld-backend` (or your preferred name)
- **Region**: Choose closest to your users (Oregon, Frankfurt, Singapore, etc.)
- **Branch**: `main` (or your deployment branch)
- **Root Directory**: Leave empty (or `backend` if deploying from subdirectory)
- **Runtime**: `Docker`
- **Dockerfile Path**: `backend/Dockerfile.prod`
- **Docker Context**: `backend`

#### Plan:
- **Starter** (Free) - Good for testing
- **Standard** ($7/month) - Recommended for production
- **Pro** ($25/month) - For high traffic

### Step 4: Set Environment Variables

Click **"Environment"** tab and add these variables:

#### Required Variables:

```bash
# Application
APP_NAME=JD LaraWorld
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-service-name.onrender.com  # ← Update after deployment
APP_KEY=base64:YOUR_GENERATED_KEY_HERE  # ← Generate this (see below)

# Database (Replace with your actual database credentials)
DB_CONNECTION=mysql
DB_HOST=your-database-host.com  # ← Your database host
DB_PORT=3306
DB_DATABASE=jd_laraworld_prod  # ← Your database name
DB_USERNAME=your_db_user  # ← Your database username
DB_PASSWORD=your_secure_password  # ← Your database password

# Cache & Session
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Mail Configuration (Replace with your SMTP details)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io  # ← Your SMTP host
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="JD LaraWorld"

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
```

#### Generate APP_KEY:

**Option 1: Generate locally**
```bash
cd backend
php artisan key:generate --show
# Copy the output and paste as APP_KEY value
```

**Option 2: Let Render generate it**
- Leave `APP_KEY` empty initially
- Render will generate it on first deploy
- Or add it manually after first deployment

### Step 5: Advanced Settings (Optional)

#### Health Check:
- **Health Check Path**: `/up` (Laravel's built-in health endpoint)

#### Auto-Deploy:
- ✅ **Auto-Deploy**: Enabled (deploys on every push to main branch)

#### Build & Deploy:
- **Build Command**: Leave empty (Docker handles it)
- **Start Command**: Leave empty (defined in Dockerfile)

### Step 6: Deploy!

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Build the Docker image
   - Start the container
   - Run health checks

3. Wait for deployment (usually 5-10 minutes for first build)

### Step 7: Run Database Migrations

After first successful deployment:

1. Go to your service dashboard
2. Click **"Shell"** tab (or use **"Manual Deploy"** → **"Run Command"**)
3. Run migrations:

```bash
php artisan migrate --force
```

Or use Render's **"Run Command"** feature:
- Command: `php artisan migrate --force`

### Step 8: Verify Deployment

1. Check your service URL: `https://your-service-name.onrender.com`
2. Test health endpoint: `https://your-service-name.onrender.com/up`
3. Test your API endpoints

## 🔐 Security Best Practices

### 1. Use Render Secrets for Sensitive Data

For sensitive values like passwords:
- Click **"Environment"** → **"Secret Files"**
- Or use **"Secrets"** feature in Render dashboard
- Never commit secrets to Git!

### 2. Production Environment Variables

**Critical differences from local:**

| Variable | Local | Production |
|----------|-------|------------|
| `APP_ENV` | `local` | `production` |
| `APP_DEBUG` | `true` | `false` |
| `APP_URL` | `http://localhost:8000` | `https://your-app.onrender.com` |
| `LOG_LEVEL` | `debug` | `error` |
| `DB_HOST` | `host.docker.internal` | Your production DB host |
| `CACHE_DRIVER` | `file` | `redis` (if available) |

### 3. Database Security

- ✅ Use strong passwords
- ✅ Restrict database access to Render's IPs (if possible)
- ✅ Use SSL connections (if your DB supports it)
- ✅ Don't expose database credentials

## 🗄️ Database Options

### Option 1: External Database (Your Current Setup)

If you have a database deployed elsewhere:
- Use the connection details you have
- Set `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

### Option 2: Render Managed Database

1. In Render dashboard: **"New +"** → **"PostgreSQL"** or **"MySQL"**
2. Choose plan (Free tier available for PostgreSQL)
3. Copy connection details
4. Update environment variables in your web service

**For PostgreSQL:**
```bash
DB_CONNECTION=pgsql
DB_HOST=dpg-xxxxx-a.render.com
DB_PORT=5432
DB_DATABASE=jd_laraworld_xxxx
DB_USERNAME=jd_laraworld_user
DB_PASSWORD=your_password
```

### Option 3: Other Cloud Databases

- **AWS RDS**
- **DigitalOcean Managed Databases**
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)

## 📊 Monitoring & Logs

### View Logs:
1. Go to your service dashboard
2. Click **"Logs"** tab
3. View real-time logs

### Common Log Locations:
- Application logs: `storage/logs/laravel.log`
- Render logs: Available in dashboard

## 🔄 Updating Your Application

### Automatic Deployments:
- Push to your `main` branch
- Render automatically detects changes
- Triggers new deployment

### Manual Deployments:
1. Go to service dashboard
2. Click **"Manual Deploy"**
3. Select branch/commit
4. Click **"Deploy"**

## 🐛 Troubleshooting

### Issue: Build Fails

**Check:**
- Dockerfile path is correct
- All dependencies in `composer.json`
- Build logs in Render dashboard

**Solution:**
```bash
# Test build locally first
cd backend
docker build -f Dockerfile.prod -t test-build .
```

### Issue: Application Won't Start

**Check:**
- Environment variables are set correctly
- Database connection is working
- Health check endpoint is accessible

**Solution:**
```bash
# Check logs in Render dashboard
# Verify APP_KEY is set
# Test database connection
```

### Issue: Database Connection Failed

**Check:**
- Database credentials are correct
- Database allows connections from Render's IPs
- Database is running and accessible

**Solution:**
```bash
# Test connection from Render shell
php artisan tinker
>>> DB::connection()->getPdo();
```

### Issue: 502 Bad Gateway

**Possible causes:**
- PHP-FPM not starting
- Nginx configuration issue
- Application crashing

**Solution:**
- Check logs in Render dashboard
- Verify Dockerfile CMD is correct
- Check health check endpoint

### Issue: Environment Variables Not Working

**Check:**
- Variables are set in Render dashboard
- No typos in variable names
- Restart service after adding variables

## 📝 Post-Deployment Checklist

- [ ] Application is accessible at Render URL
- [ ] Health check endpoint (`/up`) returns 200
- [ ] Database migrations ran successfully
- [ ] Environment variables are set correctly
- [ ] `APP_DEBUG=false` in production
- [ ] `APP_KEY` is set and secure
- [ ] Database connection is working
- [ ] API endpoints are responding
- [ ] Logs are accessible
- [ ] Auto-deploy is configured

## 🚀 Performance Optimization

### 1. Enable Caching

After deployment, cache configuration:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

(Already done in Dockerfile.prod startup script)

### 2. Use Redis (Optional)

If you add Redis service:
- Update `CACHE_DRIVER=redis`
- Update `SESSION_DRIVER=redis`
- Update `QUEUE_CONNECTION=redis`

### 3. Database Indexing

Ensure your database has proper indexes for performance.

## 📚 Additional Resources

- [Render.com Documentation](https://render.com/docs)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Need Help?

1. Check Render logs
2. Check Laravel logs: `storage/logs/laravel.log`
3. Test locally with production-like settings
4. Review this guide's troubleshooting section

---

**Congratulations!** 🎉 Your Laravel application is now deployed to Render.com!

