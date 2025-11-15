# Docker Setup Guide - Laravel Backend with Local MySQL

## 🎯 What This Does

This Dockerfile creates a container that runs your Laravel application and connects to your **local MySQL database** running on your MacBook.

## 📚 Understanding the Dockerfile (Step by Step)

### 1. **Base Image**
```dockerfile
FROM php:8.2-fpm
```
- Uses PHP 8.2 with FPM (FastCGI Process Manager)
- FPM is needed when using Nginx as a web server
- This is the foundation of your container

### 2. **Working Directory**
```dockerfile
WORKDIR /var/www/html
```
- Sets where your application files will live inside the container
- All commands run from this directory

### 3. **Install System Dependencies**
```dockerfile
RUN apt-get update && apt-get install -y ...
```
- Updates package list and installs required tools
- `default-mysql-client`: MySQL client libraries (needed to connect to MySQL)
- `libpng-dev`, `libonig-dev`, etc.: Libraries needed for PHP extensions

### 4. **Install PHP Extensions**
```dockerfile
docker-php-ext-install pdo pdo_mysql ...
```
- `pdo`: PHP Data Objects (database abstraction layer)
- `pdo_mysql`: MySQL driver for PDO (THIS IS CRITICAL for MySQL connection)
- `mbstring`: Multibyte string handling (Laravel needs this)
- `gd`: Image processing
- Other extensions Laravel commonly uses

### 5. **Install Composer**
```dockerfile
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
```
- Composer is Laravel's dependency manager
- This copies Composer from the official Composer image
- Multi-stage copy (efficient way to get Composer)

### 6. **Copy Application & Install Dependencies**
```dockerfile
COPY . /var/www/html
RUN composer install ...
```
- Copies your Laravel code into the container
- Installs all PHP packages defined in `composer.json`

### 7. **Set Permissions**
```dockerfile
RUN chown -R www-data:www-data ...
```
- Laravel needs write access to `storage/` and `bootstrap/cache/`
- `www-data` is the web server user in Linux containers

### 8. **Expose Port & Start Server**
```dockerfile
EXPOSE 9000
CMD ["php-fpm"]
```
- PHP-FPM listens on port 9000
- This is the default port for PHP-FPM

## 🔌 Connecting to Local MySQL Database

### The Magic: `host.docker.internal`

On macOS, Docker containers can access services running on your Mac using:
```
host.docker.internal
```

This is a special hostname that Docker Desktop provides to reach your host machine.

### Environment Variables You Need

When running the container, set these environment variables:

```bash
DB_CONNECTION=mysql
DB_HOST=host.docker.internal  # ← This connects to your Mac's MySQL
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

## 🚀 How to Use This Dockerfile

### Option 1: Using Docker Compose (Recommended)

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'

services:
  php:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: laravel-backend
    volumes:
      - ./backend:/var/www/html
    environment:
      - DB_CONNECTION=mysql
      - DB_HOST=host.docker.internal
      - DB_PORT=3306
      - DB_DATABASE=your_database_name
      - DB_USERNAME=root
      - DB_PASSWORD=your_password
      - APP_ENV=local
      - APP_DEBUG=true
    networks:
      - app

  nginx:
    image: nginx:alpine
    container_name: laravel-nginx
    ports:
      - "8000:80"
    volumes:
      - ./backend:/var/www/html
      - ./ops/nginx-backend.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - php
    networks:
      - app

networks:
  app:
```

Then run:
```bash
docker-compose up --build
```

### Option 2: Using Docker Commands Directly

```bash
# Build the image
docker build -t laravel-backend ./backend

# Run the container
docker run -d \
  --name laravel-backend \
  -p 9000:9000 \
  -v $(pwd)/backend:/var/www/html \
  -e DB_CONNECTION=mysql \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_DATABASE=your_database_name \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=your_password \
  laravel-backend
```

## ✅ Prerequisites on Your MacBook

1. **MySQL must be running** on your Mac
   ```bash
   # Check if MySQL is running
   brew services list
   # or
   mysql.server status
   ```

2. **MySQL must allow remote connections** (from Docker)
   - By default, MySQL on macOS might only allow `localhost`
   - You may need to configure MySQL to accept connections from Docker
   - The `host.docker.internal` should work, but verify MySQL is listening on `0.0.0.0:3306` or `127.0.0.1:3306`

3. **Create your database** (if not exists)
   ```bash
   mysql -u root -p
   CREATE DATABASE your_database_name;
   ```

## 🧪 Testing the Connection

Once your container is running:

```bash
# Enter the container
docker exec -it laravel-backend bash

# Test MySQL connection
php artisan tinker
>>> DB::connection()->getPdo();
# Should return PDO object if connected

# Or run migrations
php artisan migrate
```

## 🔍 Troubleshooting

### Issue: "Can't connect to MySQL server"

**Solution 1:** Check if MySQL is running
```bash
brew services list | grep mysql
```

**Solution 2:** Verify MySQL is listening on the right interface
```bash
# Check what MySQL is listening on
lsof -i :3306
```

**Solution 3:** Try using `127.0.0.1` instead of `host.docker.internal`
```yaml
DB_HOST=127.0.0.1
```
(Note: This might not work depending on Docker network configuration)

**Solution 4:** Use `gateway.docker.internal` (alternative)
```yaml
DB_HOST=gateway.docker.internal
```

### Issue: "Access denied for user"

- Double-check your MySQL username and password
- Make sure the user has permissions to access the database
- Try connecting from your Mac first: `mysql -u root -p`

### Issue: "Permission denied" errors

```bash
# Fix permissions inside container
docker exec -it laravel-backend chown -R www-data:www-data /var/www/html/storage
docker exec -it laravel-backend chmod -R 775 /var/www/html/storage
```

## 📝 Key Concepts Explained

### Why `host.docker.internal`?

- Docker containers run in an isolated network
- `localhost` inside a container refers to the container itself, not your Mac
- `host.docker.internal` is a special DNS name that points to your host machine (your Mac)
- This is provided by Docker Desktop on macOS/Windows

### Why PHP-FPM?

- PHP-FPM (FastCGI Process Manager) is a way to run PHP
- It's separate from the web server (Nginx)
- Nginx handles HTTP requests and forwards PHP requests to PHP-FPM
- This separation allows better performance and scalability

### Why Port 9000?

- PHP-FPM listens on port 9000 by default
- Nginx connects to PHP-FPM on this port
- This is internal communication (not exposed to the internet)

## 🎓 Next Steps

1. **Get it working first** - Make sure the container builds and connects to MySQL
2. **Add Nginx** - Use the docker-compose example above to add Nginx
3. **Learn Docker Compose** - It makes managing multiple containers easier
4. **Add Redis** - For caching and queues
5. **Add Mailhog** - For testing emails locally

## 💡 Pro Tips

1. **Use volumes for development**: `-v ./backend:/var/www/html` allows live code changes
2. **Keep vendor folder in container**: Don't mount vendor, let Composer install it in the container
3. **Use .env file**: Create a `.env` file in your backend folder with database credentials
4. **Check logs**: `docker logs laravel-backend` to see what's happening

---

**Remember**: This is a learning journey! Start simple, get it working, then add complexity. 🚀

