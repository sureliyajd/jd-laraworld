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
- **Render.com** - Deployment Platform

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

## 📁 Project Structure

```
jd-laraworld/
├── backend/                 # Laravel 12 Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
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
└── docs/                    # Documentation
    ├── ADVANCED_LARAVEL_FEATURES.md
    ├── FRONTEND_MAILER_IMPLEMENTATION.md
    ├── HORIZON_SETUP_COMPLETE.md
    └── ...
```

---

## 📚 Documentation

- **[Advanced Laravel Features](./ADVANCED_LARAVEL_FEATURES.md)** - Jobs, Queues, Broadcasting, Notifications
- **[Frontend Mailer Implementation](./FRONTEND_MAILER_IMPLEMENTATION.md)** - Email management system
- **[Horizon Setup Guide](./HORIZON_SETUP_COMPLETE.md)** - Queue monitoring setup
- **[Pusher Setup Guide](./PUSHER_SETUP_GUIDE.md)** - Real-time features configuration
- **[Deployment Guide](./QUICK_DEPLOY.md)** - Quick deployment to Render.com
- **[Deployment Summary](./DEPLOYMENT_SUMMARY.md)** - Complete deployment information
- **[Modules Implementation](./MODULES_IMPLEMENTATION.md)** - Module details

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

## 🚢 Deployment

The project is configured for deployment on **Render.com** with:
- Docker-based deployment
- Production-ready Dockerfile
- Environment configuration
- Health check endpoints

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for detailed deployment instructions.

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
- 💼 **LinkedIn**: [linkedin.com/in/jaydeepsureliya](https://linkedin.com/in/jaydeepsureliya)
- 🐙 **GitHub**: [github.com/jaydeepsureliya](https://github.com/jaydeepsureliya)

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
