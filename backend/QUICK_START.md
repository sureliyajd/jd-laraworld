# 🚀 Quick Start - Docker with Local MySQL

## Step 1: Make Sure MySQL is Running on Your Mac

```bash
# Check if MySQL is running
brew services list | grep mysql

# If not running, start it
brew services start mysql

# Or if you installed MySQL differently
mysql.server start
```

## Step 2: Create Your Database (if needed)

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE laravel;
# (or use your existing database name)

# Exit MySQL
exit;
```

## Step 3: Update Database Credentials

Edit `docker-compose.simple.yml` and update these lines:

```yaml
DB_DATABASE: laravel        # Your database name
DB_USERNAME: root           # Your MySQL username
DB_PASSWORD: your_password  # Your MySQL password
```

## Step 4: Build and Start Containers

```bash
# From project root directory
docker-compose -f docker-compose.simple.yml up --build
```

This will:
- Build your PHP container
- Start PHP-FPM and Nginx
- Connect to your local MySQL

## Step 5: Access Your Application

Open your browser:
```
http://localhost:8000
```

## Step 6: Run Laravel Setup (First Time)

In a new terminal:

```bash
# Enter the PHP container
docker exec -it laravel-php bash

# Generate application key (if not exists)
php artisan key:generate

# Run migrations
php artisan migrate

# Exit container
exit
```

## ✅ That's It!

Your Laravel app is now running in Docker and connected to your local MySQL!

## 🔧 Common Commands

```bash
# Stop containers
docker-compose -f docker-compose.simple.yml down

# View logs
docker-compose -f docker-compose.simple.yml logs -f

# Rebuild after Dockerfile changes
docker-compose -f docker-compose.simple.yml up --build

# Access container shell
docker exec -it laravel-php bash
```

## 🐛 Troubleshooting

**Can't connect to MySQL?**
- Make sure MySQL is running: `brew services list`
- Check your credentials in `docker-compose.simple.yml`
- Try: `mysql -u root -p` from your Mac to verify credentials

**Permission errors?**
```bash
docker exec -it laravel-php chmod -R 775 storage bootstrap/cache
```

**Port 8000 already in use?**
Change the port in `docker-compose.simple.yml`:
```yaml
ports:
  - "8001:80"  # Use port 8001 instead
```

