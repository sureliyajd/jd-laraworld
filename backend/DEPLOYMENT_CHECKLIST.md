# ✅ Deployment Checklist for Render.com

Use this checklist to ensure a smooth deployment to Render.com.

## 📋 Pre-Deployment

### Code Preparation
- [ ] All code is committed to Git
- [ ] Code is pushed to your repository (GitHub/GitLab/Bitbucket)
- [ ] `Dockerfile.prod` exists and is correct
- [ ] `render.yaml` is configured (optional, for blueprint deployment)
- [ ] No sensitive data (passwords, keys) in code
- [ ] `.env` file is in `.gitignore`

### Database Preparation
- [ ] Database is deployed and accessible
- [ ] Database credentials are ready
- [ ] Database has been tested locally
- [ ] Migrations are ready to run
- [ ] Seeders are ready (if needed)

### Environment Variables Preparation
- [ ] `APP_KEY` is generated (or ready to generate)
- [ ] Database connection details are ready
- [ ] SMTP/mail configuration is ready
- [ ] All required environment variables are documented

---

## 🚀 Deployment Steps

### Step 1: Create Render Service
- [ ] Created Render.com account
- [ ] Connected Git repository
- [ ] Created new Web Service
- [ ] Set service name
- [ ] Selected region
- [ ] Selected branch (main/master)

### Step 2: Configure Docker
- [ ] Runtime: Docker
- [ ] Dockerfile Path: `backend/Dockerfile.prod`
- [ ] Docker Context: `backend`
- [ ] Build Command: (leave empty)
- [ ] Start Command: (leave empty)

### Step 3: Set Environment Variables
- [ ] `APP_NAME` = "JD LaraWorld"
- [ ] `APP_ENV` = "production"
- [ ] `APP_DEBUG` = "false"
- [ ] `APP_URL` = (set after deployment)
- [ ] `APP_KEY` = (generated or set)
- [ ] `DB_CONNECTION` = "mysql"
- [ ] `DB_HOST` = (your database host)
- [ ] `DB_PORT` = "3306"
- [ ] `DB_DATABASE` = (your database name)
- [ ] `DB_USERNAME` = (your database user)
- [ ] `DB_PASSWORD` = (your database password)
- [ ] `CACHE_DRIVER` = "file"
- [ ] `SESSION_DRIVER` = "file"
- [ ] `QUEUE_CONNECTION` = "sync"
- [ ] Mail configuration variables set
- [ ] `LOG_LEVEL` = "error"

### Step 4: Deploy
- [ ] Clicked "Create Web Service"
- [ ] Build started successfully
- [ ] Build completed without errors
- [ ] Service is running
- [ ] Health check passed (`/up` endpoint)

### Step 5: Post-Deployment
- [ ] Updated `APP_URL` with actual Render URL
- [ ] Ran database migrations: `php artisan migrate --force`
- [ ] Tested health endpoint: `https://your-app.onrender.com/up`
- [ ] Tested API endpoints
- [ ] Verified database connection
- [ ] Checked application logs

---

## 🔍 Verification

### Application Health
- [ ] Service is accessible at Render URL
- [ ] Health check endpoint returns 200: `/up`
- [ ] No 500 errors in logs
- [ ] Application loads correctly

### Database
- [ ] Database connection successful
- [ ] Migrations ran successfully
- [ ] Can query database from application
- [ ] No database errors in logs

### API Endpoints
- [ ] API endpoints are accessible
- [ ] Authentication works (if applicable)
- [ ] CRUD operations work
- [ ] No CORS issues (if frontend is separate)

### Security
- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] No sensitive data exposed in logs
- [ ] Passwords are secure
- [ ] SSL/HTTPS is enabled (Render provides this)

---

## 🐛 Troubleshooting Checklist

If something goes wrong:

### Build Fails
- [ ] Check Dockerfile path is correct
- [ ] Check Docker context is correct
- [ ] Review build logs in Render dashboard
- [ ] Test Dockerfile locally: `docker build -f backend/Dockerfile.prod -t test .`

### Service Won't Start
- [ ] Check environment variables are set
- [ ] Check `APP_KEY` is set
- [ ] Review service logs
- [ ] Check health check endpoint

### Database Connection Fails
- [ ] Verify database credentials
- [ ] Check database is accessible from Render
- [ ] Test connection from Render shell
- [ ] Check database firewall/security groups

### 502 Bad Gateway
- [ ] Check PHP-FPM is running
- [ ] Check Nginx configuration
- [ ] Review application logs
- [ ] Check for PHP errors

### Environment Variables Not Working
- [ ] Verify variable names (case-sensitive)
- [ ] Check for typos
- [ ] Restart service after adding variables
- [ ] Clear config cache: `php artisan config:clear`

---

## 📊 Performance Optimization

After successful deployment:

- [ ] Config cache is enabled (already in Dockerfile)
- [ ] Route cache is enabled (already in Dockerfile)
- [ ] View cache is enabled (already in Dockerfile)
- [ ] Database indexes are optimized
- [ ] Consider Redis for caching (optional)

---

## 🔄 Continuous Deployment

- [ ] Auto-deploy is enabled
- [ ] Main branch triggers deployments
- [ ] Deployment notifications are set up (optional)

---

## 📝 Documentation

- [ ] Deployment guide is documented
- [ ] Environment variables are documented
- [ ] Team members know how to deploy
- [ ] Rollback procedure is known

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Service is accessible
- ✅ Health check passes
- ✅ Database is connected
- ✅ API endpoints work
- ✅ No errors in logs
- ✅ Application behaves as expected

---

## 🆘 Emergency Contacts

- Render Support: [support@render.com](mailto:support@render.com)
- Render Docs: [render.com/docs](https://render.com/docs)
- Laravel Docs: [laravel.com/docs](https://laravel.com/docs)

---

**Last Updated:** After deployment, update this checklist with any issues encountered and their solutions for future reference.

