<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\TaskAttachmentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TaskAssignmentController;

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
    
    // Task Assignment API Routes
    Route::apiResource('task-assignments', TaskAssignmentController::class);
    Route::post('/task-assignments/bulk-assign', [TaskAssignmentController::class, 'bulkAssign'])->name('api.assignments.bulk');
    Route::get('/tasks/{task}/assignments', [TaskAssignmentController::class, 'getTaskAssignments'])->name('api.tasks.assignments');
    Route::get('/users/{user}/assignments', [TaskAssignmentController::class, 'getUserAssignments'])->name('api.users.assignments');
    Route::get('/task-assignments/statistics/overview', [TaskAssignmentController::class, 'statistics'])->name('api.assignments.statistics');
});
