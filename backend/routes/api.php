<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\TaskAttachmentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TaskAssignmentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\EmailLogController;
use App\Http\Controllers\Api\DevOpsController;
use App\Http\Controllers\Api\LogHorizonController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Authentication routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // Legacy route for backward compatibility
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Task Management API Routes
    Route::apiResource('tasks', TaskController::class);
    Route::get('/tasks/statistics/overview', [TaskController::class, 'statistics'])->name('api.tasks.statistics');
    
    // Category Management API Routes
    Route::apiResource('categories', CategoryController::class);
    
    // Task Comments API Routes
    Route::apiResource('task-comments', TaskCommentController::class);
    
    // Task Attachments API Routes
    Route::apiResource('task-attachments', TaskAttachmentController::class);
    Route::get('/task-attachments/{attachment}/download', [TaskAttachmentController::class, 'download'])
        ->name('api.attachments.download');
    
    // User Management API Routes
    Route::apiResource('users', UserController::class);
    Route::get('/users/statistics/overview', [UserController::class, 'statistics'])->name('api.users.statistics');
    Route::get('/users/all/list', [UserController::class, 'all'])->name('api.users.all');
    Route::get('/users/roles/list', [UserController::class, 'roles'])->name('api.users.roles');
    
    // Task Assignment API Routes
    Route::apiResource('task-assignments', TaskAssignmentController::class);
    Route::post('/task-assignments/bulk-assign', [TaskAssignmentController::class, 'bulkAssign'])->name('api.assignments.bulk');
    Route::get('/tasks/{task}/assignments', [TaskAssignmentController::class, 'getTaskAssignments'])->name('api.tasks.assignments');
    Route::get('/users/{user}/assignments', [TaskAssignmentController::class, 'getUserAssignments'])->name('api.users.assignments');
    Route::get('/task-assignments/statistics/overview', [TaskAssignmentController::class, 'statistics'])->name('api.assignments.statistics');
    
    // Notification API Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('api.notifications.index');
    Route::get('/notifications/statistics', [NotificationController::class, 'statistics'])->name('api.notifications.statistics');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('api.notifications.read');
    Route::patch('/notifications/mark-multiple-read', [NotificationController::class, 'markMultipleAsRead'])->name('api.notifications.mark-multiple-read');
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('api.notifications.destroy');
    
    // Email Logs API Routes (Mail Command Center)
    Route::apiResource('email-logs', EmailLogController::class);
    Route::get('/email-logs/statistics/overview', [EmailLogController::class, 'statistics'])->name('api.email-logs.statistics');
    
    // DevOps API Routes (Infrastructure Gallery)
    Route::get('/devops', [DevOpsController::class, 'index'])->name('api.devops.index');
    Route::get('/devops/docker', [DevOpsController::class, 'docker'])->name('api.devops.docker');
    Route::get('/devops/terraform', [DevOpsController::class, 'terraform'])->name('api.devops.terraform');
    Route::get('/devops/github-actions', [DevOpsController::class, 'githubActions'])->name('api.devops.github-actions');
    Route::get('/devops/infrastructure', [DevOpsController::class, 'infrastructure'])->name('api.devops.infrastructure');
    Route::get('/devops/cicd', [DevOpsController::class, 'cicd'])->name('api.devops.cicd');
    
    // Log Horizon API Routes
    Route::get('/log-horizon', [LogHorizonController::class, 'index'])->name('api.log-horizon.index');
    Route::get('/log-horizon/statistics', [LogHorizonController::class, 'statistics'])->name('api.log-horizon.statistics');
});

// Broadcasting auth route for SPA using Passport bearer token
Broadcast::routes(['middleware' => ['auth:api']]);
