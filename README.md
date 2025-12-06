<div align="center">

# 🚀 Jd's LaraWorld

**A Production-Ready Full-Stack Portfolio Showcase**

*Live demonstration of Laravel + React development skills*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-purple?style=for-the-badge&logo=laravel)](https://sureliyajd.github.io/jd-laraworld)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## 📖 About This Project

**Jd's LaraWorld** is a comprehensive full-stack portfolio showcase that demonstrates production-ready development skills through a live, interactive portal. This project serves as a real-world example of modern web development practices, architectural decisions, and enterprise-level features implementation.

### 🎯 Purpose

This showcase is designed to demonstrate expertise in:
- Building scalable full-stack applications
- Implementing robust authentication and authorization systems
- Managing complex state and real-time updates
- Following industry best practices and clean code architecture
- Creating production-ready applications with comprehensive testing

**Live Demo:** [https://sureliyajd.github.io/jd-laraworld](https://sureliyajd.github.io/jd-laraworld)

---

## ✨ Key Features

### 🔐 **Authentication & Authorization**
- **OAuth2 Authentication** with Laravel Passport
- **Role-Based Access Control (RBAC)** using Spatie Laravel Permissions
- Three distinct roles: **Super Admin**, **Visitor**, and **Public** (demo mode)
- Fine-grained permission management across all modules
- Token-based API authentication

### 🪙 **Credit-Based System**
- Smart resource management with credit tracking
- Monitor usage across modules (users, emails, tasks)
- Super admins get unlimited credits
- Real-time credit balance display

### 📋 **Task Management System**
- Full CRUD operations for tasks
- Task assignments with multiple roles (assignee, reviewer, observer)
- File attachments with preview and download
- Comments and activity tracking
- Priority and status management
- Category organization
- Task statistics and analytics

### 👥 **User Management**
- Complete user CRUD operations
- Role assignment and permission management
- User statistics and activity tracking
- Task statistics per user
- Credit management for visitors

### 📧 **Mail Command Center**
- Send emails with HTML and plain text support
- Multiple mailer providers (SMTP, Mailgun, AWS SES, Postmark, Resend, etc.)
- Email logs with comprehensive tracking
- Mailer configuration management
- Email statistics dashboard
- Test mailer functionality

### ⚡ **Advanced Laravel Features**
- **Jobs & Queues** - Asynchronous task processing
- **Real-Time Broadcasting** - WebSocket integration with Pusher
- **Notifications System** - Database and broadcast notifications
- **Event-Driven Architecture** - Events and listeners
- **Laravel Horizon** - Queue monitoring dashboard (optional)

### 🏗️ **Infrastructure Gallery**
- Docker configuration showcase
- Infrastructure as Code examples
- CI/CD pipeline information
- DevOps best practices demonstration

### 📊 **Real-Time Updates**
- Live notifications via WebSocket
- Toast alerts for instant feedback
- Notification center with filtering
- Real-time task updates

### 🧪 **Comprehensive Testing**
- **71+ Unit Tests** with **88%+ Code Coverage**
- Feature testing for critical workflows
- API endpoint testing
- Model and service layer testing

---

## 🛠️ Tech Stack

### Backend
- **Laravel 12** - PHP Framework
- **Laravel Passport** - OAuth2 Authentication
- **Spatie Permissions** - Role & Permission Management
- **Laravel Horizon** - Queue Monitoring (optional)
- **Eloquent ORM** - Database Abstraction
- **MySQL/SQLite** - Database
- **Redis** - Caching & Queues (optional)

### Frontend
- **React 18** - UI Framework
- **TypeScript 5.8** - Type Safety
- **Vite 5** - Build Tool
- **Tailwind CSS 3.4** - Styling
- **shadcn/ui** - UI Component Library
- **Laravel Echo** - Real-Time Events
- **React Router** - Navigation

### DevOps & Tools
- **Docker** - Containerization
- **GitHub Actions** - CI/CD

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Portal UI  │  │  Task Mgmt   │  │  User Mgmt   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Mail Center  │  │  DevOps      │  │  Horizon     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ REST API (OAuth2)
                         │
┌─────────────────────────────────────────────────────────────┐
│              Backend (Laravel 12)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   API Layer  │  │  Services    │  │   Policies   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Jobs      │  │   Events     │  │ Notifications│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                         │
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Database│    │  Redis  │    │  Pusher │
    │ MySQL   │    │ Queues  │    │  Real-  │
    │         │    │ Cache   │    │  Time   │
    └─────────┘    └─────────┘    └─────────┘
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login (OAuth2)
- `GET /api/me` - Get current user
- `POST /api/logout` - Logout
- `POST /api/refresh` - Refresh token

### Task Management
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/statistics/overview` - Task statistics

### User Management
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/statistics/overview` - User statistics
- `GET /api/users/all/list` - Get all users (dropdown)
- `GET /api/users/roles/list` - Get all roles

### Task Assignments
- `GET /api/task-assignments` - List assignments
- `POST /api/task-assignments` - Create assignment
- `PUT /api/task-assignments/{id}` - Update assignment
- `DELETE /api/task-assignments/{id}` - Delete assignment
- `GET /api/tasks/{task}/assignments` - Get task assignments
- `GET /api/users/{user}/assignments` - Get user assignments

### Email Management
- `GET /api/email-logs` - List email logs
- `POST /api/email-logs` - Send email
- `GET /api/email-logs/{id}` - Get email details
- `GET /api/email-logs/statistics/overview` - Email statistics

### Mailer Management
- `GET /api/mailers` - List mailers
- `POST /api/mailers` - Create mailer
- `PUT /api/mailers/{id}` - Update mailer
- `DELETE /api/mailers/{id}` - Delete mailer
- `POST /api/mailers/{id}/test` - Test mailer
- `POST /api/mailers/{id}/activate` - Activate mailer
- `POST /api/mailers/{id}/deactivate` - Deactivate mailer
- `GET /api/mailers/providers/list` - Get supported providers

### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/{id}/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification
- `GET /api/notifications/statistics` - Notification statistics

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Attachments & Comments
- `GET /api/task-attachments` - List attachments
- `POST /api/task-attachments` - Upload attachment
- `GET /api/task-attachments/{id}/download` - Download attachment
- `GET /api/task-comments` - List comments
- `POST /api/task-comments` - Create comment

### DevOps & Infrastructure
- `GET /api/devops` - Get DevOps information
- `GET /api/devops/docker` - Docker configuration
- `GET /api/devops/terraform` - Terraform configuration
- `GET /api/devops/github-actions` - CI/CD workflows

### Log Horizon
- `GET /api/log-horizon` - Get Horizon information
- `GET /api/log-horizon/statistics` - Queue statistics

> **Note:** All endpoints (except `/api/register` and `/api/login`) require authentication via Bearer token.

---

## 👤 User Roles & Permissions

### 🔑 **Super Admin**
- Full access to all features
- Unlimited credits
- User management
- System configuration
- All permissions enabled

### 🎫 **Visitor**
- Can perform actions with credits
- Create and manage tasks
- Send emails (with credit cost)
- View assigned tasks
- Limited permissions based on credit system

### 🌍 **Public (Demo Mode)**
- View-only access
- No credit consumption
- Perfect for exploring the portal
- All actions are disabled

### Permission Groups
- **Task Management**: Create, edit, delete, assign tasks
- **User Management**: View, create, edit, delete users
- **Email Management**: Send emails, view logs, manage mailers
- **Roles & Permissions**: View roles, assign roles, manage permissions

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL/SQLite
- (Optional) Redis for queues
- (Optional) Pusher account for real-time features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jd-laraworld.git
   cd jd-laraworld
   ```

2. **Backend Setup**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   php artisan passport:install
   php artisan serve
   ```

3. **Frontend Setup**
   ```bash
   cd lara-world-showcase
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Start Queue Worker** (optional)
   ```bash
   cd backend
   php artisan queue:work
   ```

5. **Start Horizon** (optional, requires Redis)
   ```bash
   cd backend
   php artisan horizon
   ```

### Environment Variables

See detailed configuration in:
- `backend/.env.example`
- `lara-world-showcase/.env.example`

---

## 🐳 Docker Deployment

The backend includes a production-ready Dockerfile that bundles Nginx + PHP-FPM for easy deployment to any cloud platform (Render, AWS, DigitalOcean, etc.).

### Step 1: Generate Required Keys Locally

Before deploying, generate these keys on your local machine:

```bash
cd backend

# Generate Laravel application key
php artisan key:generate --show
# Output: base64:xxxxxxxxxxxxx... (copy this)

# Generate Passport OAuth keys
php artisan passport:keys
# Creates: storage/oauth-private.key and storage/oauth-public.key
```

### Step 2: Set Environment Variables

Configure these environment variables in your deployment platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_KEY` | Laravel app key (from step 1) | `base64:xxxxx...` |
| `APP_ENV` | Environment | `production` |
| `APP_DEBUG` | Debug mode | `false` |
| `APP_URL` | Your API URL | `https://api.yourdomain.com` |
| `DB_CONNECTION` | Database driver | `mysql` |
| `DB_HOST` | Database host | `your-db-host.com` |
| `DB_PORT` | Database port | `3306` |
| `DB_DATABASE` | Database name | `laraworld` |
| `DB_USERNAME` | Database username | `your_user` |
| `DB_PASSWORD` | Database password | `your_password` |

### Step 3: Configure Passport OAuth Keys

Choose one of these options:

**Option A: Environment Variables (Recommended)**
```bash
# Set the contents of your key files as environment variables:
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...your private key content...
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...your public key content...
-----END PUBLIC KEY-----"
```

**Option B: Secret Files**
Mount your keys to:
- `/etc/secrets/oauth-private.key`
- `/etc/secrets/oauth-public.key`

### Step 4: Build and Deploy

```bash
cd backend

# Build the Docker image
docker build -t laraworld-backend .

# Run locally for testing
docker run -p 80:80 \
  -e APP_KEY="base64:your-key-here" \
  -e APP_ENV=production \
  -e DB_CONNECTION=mysql \
  -e DB_HOST=host.docker.internal \
  -e DB_DATABASE=laraworld \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=password \
  laraworld-backend
```

### Step 5: Post-Deployment Setup

After the container is running, execute these one-time commands:

```bash
# SSH into your container/server and run:
php artisan migrate --force
php artisan db:seed --force
php artisan passport:client --personal --name="Personal Access Client"
```

### Docker Deployment Platforms

The Dockerfile works with:
- **Render.com** - Use Web Service with Docker runtime
- **AWS ECS/Fargate** - Deploy as container
- **DigitalOcean App Platform** - Use container deployment
- **Google Cloud Run** - Serverless container
- **Heroku** - With container registry

> **Note:** The container exposes port 80 (Nginx). Configure your platform to route traffic to this port.

---

## 📁 Project Structure

```
jd-laraworld/
├── backend/                 # Laravel 12 Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   ├── Resources/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   ├── Policies/
│   │   ├── Jobs/
│   │   ├── Events/
│   │   ├── Notifications/
│   │   └── Services/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
├── lara-world-showcase/     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── contexts/
│   └── public/
├── ADVANCED_LARAVEL_FEATURES.md
├── FRONTEND_MAILER_IMPLEMENTATION.md
├── HORIZON_SETUP_COMPLETE.md
├── PUSHER_SETUP_GUIDE.md
└── README.md
```

---

## 📚 Documentation

- **[Advanced Laravel Features](./ADVANCED_LARAVEL_FEATURES.md)** - Jobs, Queues, Broadcasting, Notifications
- **[Frontend Mailer Implementation](./FRONTEND_MAILER_IMPLEMENTATION.md)** - Email management system
- **[Horizon Setup Guide](./HORIZON_SETUP_COMPLETE.md)** - Queue monitoring setup
- **[Pusher Setup Guide](./PUSHER_SETUP_GUIDE.md)** - Real-time features configuration

---

## 🎨 Features Showcase

### 🔐 Authentication Flow
1. User logs in with credentials
2. Receives OAuth2 access token
3. Token used for all API requests
4. Permissions checked on every action

### 📋 Task Management Flow
1. Create task with details (title, description, priority, due date)
2. Assign users with different roles
3. Upload attachments (images, documents)
4. Add comments and track progress
5. Real-time updates via WebSocket

### 📧 Email System Flow
1. Configure mailer (SMTP, Mailgun, etc.)
2. Test mailer configuration
3. Activate mailer
4. Send emails via API
5. Track delivery status and logs

### 🪙 Credit System Flow
1. Super admin assigns credits to visitors
2. Actions consume credits (create user, send email, etc.)
3. Real-time credit balance display
4. Request more credits when needed

---

## 🧪 Testing

The project includes comprehensive test coverage:

- **71+ Unit Tests** covering:
  - Models and relationships
  - Services and business logic
  - API endpoints
  - Permission checks
  - Credit system

- **88%+ Code Coverage**

Run tests:
```bash
cd backend
php artisan test
php artisan test --coverage
```

---

---

## 🔒 Security Features

- **OAuth2 Authentication** with Laravel Passport
- **Role-Based Access Control** with Spatie Permissions
- **API Rate Limiting**
- **CSRF Protection** for web routes
- **Password Hashing** (bcrypt)
- **SQL Injection Protection** (Eloquent ORM)
- **XSS Protection**
- **Secure File Upload** validation

---

## 🤝 Contributing

This is a portfolio project showcasing development skills. However, suggestions and feedback are welcome!

---

## 👨‍💻 Author

**Jaydeep Sureliya**

- 🌐 **Portfolio**: [https://sureliyajd.github.io/jd-laraworld](https://sureliyajd.github.io/jd-laraworld)
- 📧 **Email**: Contact via portfolio
- 💼 **LinkedIn**: [linkedin.com/in/jd-sureliya](https://www.linkedin.com/in/jd-sureliya/)
- 🐙 **GitHub**: [github.com/sureliyajd](https://github.com/sureliyajd)

---

## 📄 License

This project is a portfolio showcase. All code is available for demonstration purposes.

---

## 🙏 Acknowledgments

- **Laravel** - The PHP Framework for Web Artisans
- **React** - A JavaScript library for building user interfaces
- **Spatie** - For the excellent Laravel Permissions package
- **shadcn/ui** - Beautiful UI components
- **All Open Source Contributors** - For amazing tools and libraries

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Built with ❤️ and lots of ☕**

[🔝 Back to Top](#-jds-laraworld)

</div>
