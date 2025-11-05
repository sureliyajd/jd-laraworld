# Advanced Laravel Features Implementation

This document showcases the implementation of advanced Laravel capabilities in the LaraWorld demo project:

## 🚀 Features Implemented

### 1. Jobs & Queues
- **Database Queue Driver**: Configured Laravel to use database queues
- **Job Classes Created**:
  - `SendTaskAssignedEmail`: Simulates sending email notifications when tasks are assigned
  - `ProcessTaskUpdate`: Simulates heavy processing when tasks are updated
  - `SendTaskNotification`: Handles different types of task notifications
- **Retry Logic**: All jobs include retry mechanisms with exponential backoff
- **Failed Jobs**: Automatic failed job handling with detailed logging

### 2. Broadcasting & Real-time Events
- **Event Classes**:
  - `TaskAssigned`: Broadcasts when a task is assigned to a user
  - `TaskUpdated`: Broadcasts when a task is updated
- **Private Channels**: Events broadcast to user-specific private channels (`user.{id}`)
- **Authorization**: Broadcasting auth endpoint protected via API auth (`auth:api`), requires Bearer token
- **Real-time Data**: Events include relevant task and user information

### 3. Notifications System
- **Database Notifications**: All notifications stored in database
- **Notification Classes**:
  - `TaskAssignedNotification`: Sent when users are assigned to tasks
  - `TaskUpdatedNotification`: Sent when tasks are updated
- **API Endpoints**: Full CRUD operations for notifications
- **Real-time Integration**: Notifications trigger real-time events

### 4. React Frontend Integration
- **Laravel Echo**: Real-time event listening
- **Pusher Integration**: WebSocket connection for live updates
- **Notification Center**: Complete notification management UI
- **Toast Notifications**: Real-time toast alerts for new events
- **Context Provider**: Global notification state management
 - **Demo Mode**: If Pusher credentials are not configured, the app runs without real-time and logs guidance to enable it

## 📁 File Structure

### Backend (Laravel)
```
backend/
├── app/
│   ├── Jobs/
│   │   ├── SendTaskAssignedEmail.php
│   │   ├── ProcessTaskUpdate.php
│   │   └── SendTaskNotification.php
│   ├── Events/
│   │   ├── TaskAssigned.php
│   │   └── TaskUpdated.php
│   ├── Notifications/
│   │   ├── TaskAssignedNotification.php
│   │   └── TaskUpdatedNotification.php
│   ├── Providers/
│   │   └── BroadcastServiceProvider.php
│   └── Http/Controllers/Api/
│       └── NotificationController.php
├── config/
│   └── broadcasting.php
├── routes/
│   └── channels.php
└── database/migrations/
    └── create_notifications_table.php
```

### Frontend (React)
```
lara-world-showcase/src/
├── services/
│   └── notificationService.ts
├── hooks/
│   └── useRealtimeNotifications.ts
├── components/
│   ├── NotificationCenter.tsx
│   └── NotificationBell.tsx
└── contexts/
    └── NotificationContext.tsx
```

## 🔧 Configuration

### Environment Variables
```env
# Laravel Backend
QUEUE_CONNECTION=database
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1

# React Frontend
VITE_PUSHER_APP_KEY=your-app-key
VITE_PUSHER_APP_CLUSTER=mt1

# Frontend -> Backend API base URLs
# e.g. http://localhost:8001 and http://localhost:8001/api
VITE_API_BASE=http://localhost:8001
VITE_API_BASE_ENDPOINT=http://localhost:8001/api
```

## 🚀 Usage

### 1. Start the Queue Worker
```bash
cd backend
php artisan queue:work
```

### 2. Start the Laravel Server
```bash
cd backend
php artisan serve
```

### 3. Start the React Development Server
```bash
cd lara-world-showcase
npm run dev
```

### 4. Authenticate (Required for API & Broadcasting)
- Login via the frontend to obtain an access token (Laravel Passport)
- The frontend attaches `Authorization: Bearer <token>` to API and broadcasting auth requests

### 5. Test the Implementation
```bash
cd backend
php demo-queue-test.php
```

## 📊 API Endpoints

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/statistics` - Get notification stats
- `PATCH /api/notifications/{id}/read` - Mark as read
- `PATCH /api/notifications/mark-multiple-read` - Mark multiple notifications as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification

All endpoints require `Authorization: Bearer <token>`.

## 🔄 Workflow

### When a Task is Assigned:
1. **Job Dispatch**: `SendTaskAssignedEmail` job queued
2. **Event Broadcast**: `TaskAssigned` event broadcast to private channel `user.{id}` (event `task.assigned`)
3. **Notification**: Database notification created
4. **Real-time Update**: React frontend receives live notification

### When a Task is Updated:
1. **Job Dispatch**: `ProcessTaskUpdate` job queued
2. **Event Broadcast**: `TaskUpdated` event broadcast to private channel `user.{id}` (event `task.updated`)
3. **Notification**: Database notification sent to assigned users
4. **Real-time Update**: React frontend shows live updates

## 🧪 Testing

### Manual Testing
1. Create a task and assign it to a user
2. Check the `jobs` table for queued jobs
3. Run `php artisan queue:work` to process jobs
4. Check the `notifications` table for stored notifications
5. Open the React frontend to see real-time notifications

### Demo Script
Run the included demo script to test all features:
```bash
php demo-queue-test.php
```

## 🎯 Key Benefits

1. **Scalability**: Jobs can be processed by multiple workers
2. **Reliability**: Failed jobs are tracked and can be retried
3. **Real-time**: Users get instant notifications
4. **Persistence**: All notifications stored in database
5. **User Experience**: Rich notification center with filtering and management

## 🔍 Monitoring

### Queue Monitoring
- Check `jobs` table for pending jobs
- Check `failed_jobs` table for failed jobs
- Monitor queue worker logs

### Notification Monitoring
- Check `notifications` table for user notifications
- Monitor real-time connection status in browser console
- Check Laravel logs for job processing
  - Browser console includes `[RT]` diagnostics for connection and subscription events

This implementation demonstrates Laravel's powerful queue system, real-time broadcasting capabilities, and comprehensive notification management - all integrated seamlessly with a modern React frontend.
