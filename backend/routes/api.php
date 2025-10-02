<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\TaskAttachmentController;

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
});
