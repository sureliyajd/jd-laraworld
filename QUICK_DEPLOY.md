# 🚀 Quick Deploy to Render.com

Fast reference guide for deploying to Render.com.

## ⚡ Quick Steps

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [render.com](https://render.com)
   - New + → Web Service
   - Connect your Git repository
   - Select `jd-laraworld` repository

3. **Configure Service**
   - **Name**: `jd-laraworld-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile.prod`
   - **Docker Context**: `backend`

4. **Set Environment Variables** (Critical!)

   ```bash
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-service-name.onrender.com
   APP_KEY=base64:YOUR_KEY_HERE  # Generate: php artisan key:generate --show
   
   DB_CONNECTION=mysql
   DB_HOST=your-database-host.com
   DB_PORT=3306
   DB_DATABASE=jd_laraworld_prod
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   
   CACHE_DRIVER=file
   SESSION_DRIVER=file
   QUEUE_CONNECTION=sync
   
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=587
   MAIL_USERNAME=your_smtp_user
   MAIL_PASSWORD=your_smtp_pass
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@yourdomain.com
   
   LOG_LEVEL=error
   ```

5. **Deploy!**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build
   - Check logs if issues occur

6. **Run Migrations**
   - Go to service dashboard
   - Click "Shell" or "Run Command"
   - Run: `php artisan migrate --force`

7. **Update APP_URL**
   - After deployment, copy your Render URL
   - Update `APP_URL` environment variable
   - Restart service

8. **Test**
   - Visit: `https://your-service-name.onrender.com/up`
   - Should return: `healthy`

## 📚 Full Documentation

- **Complete Guide**: `backend/RENDER_DEPLOYMENT_GUIDE.md`
- **Environment Variables**: `backend/PRODUCTION_ENV_VARIABLES.md`
- **Checklist**: `backend/DEPLOYMENT_CHECKLIST.md`

## 🔑 Generate APP_KEY

```bash
cd backend
php artisan key:generate --show
# Copy the output and use as APP_KEY value
```

## ⚠️ Important Notes

- **Never** set `APP_DEBUG=true` in production
- **Always** use strong database passwords
- **Update** `APP_URL` after first deployment
- **Test** database connection before deploying
- **Check** logs if something goes wrong

## 🆘 Quick Troubleshooting

**Build fails?**
- Check Dockerfile path: `backend/Dockerfile.prod`
- Check Docker context: `backend`

**Service won't start?**
- Check `APP_KEY` is set
- Check all environment variables are set
- Review logs in Render dashboard

**Database connection fails?**
- Verify credentials
- Check database is accessible
- Test from Render shell: `php artisan tinker`

**502 Bad Gateway?**
- Check service logs
- Verify health endpoint: `/up`
- Check PHP-FPM is running

## ✅ Success Checklist

- [ ] Service is accessible
- [ ] `/up` endpoint returns "healthy"
- [ ] Database migrations ran
- [ ] API endpoints work
- [ ] No errors in logs

---

**That's it!** Your app should be live on Render.com! 🎉

