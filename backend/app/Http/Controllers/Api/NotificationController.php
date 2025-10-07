<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of the user's notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = $user->notifications();

        // Filter by type
        if ($request->has('type')) {
            $query->where('data->type', $request->type);
        }

        // Filter by read status
        if ($request->has('read')) {
            if ($request->boolean('read')) {
                $query->whereNotNull('read_at');
            } else {
                $query->whereNull('read_at');
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $notifications = $query->paginate($perPage);

        return response()->json([
            'data' => NotificationResource::collection($notifications->items()),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->findOrFail($id);

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marked as read',
            'data' => new NotificationResource($notification),
        ]);
    }

    /**
     * Mark multiple notifications as read.
     */
    public function markMultipleAsRead(Request $request): JsonResponse
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'string|exists:notifications,id',
        ]);

        $user = $request->user();
        $notifications = $user->notifications()
            ->whereIn('id', $request->notification_ids)
            ->whereNull('read_at')
            ->get();

        foreach ($notifications as $notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => "Marked {$notifications->count()} notifications as read",
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = $user->unreadNotifications()->count();
        
        $user->unreadNotifications->markAsRead();

        return response()->json([
            'message' => "Marked {$count} notifications as read",
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->findOrFail($id);

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully',
        ]);
    }

    /**
     * Get notification statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = [
            'total' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'by_type' => $user->notifications()
                ->reorder()
                ->selectRaw('JSON_EXTRACT(data, "$.type") as type, COUNT(*) as count')
                ->groupByRaw('JSON_EXTRACT(data, "$.type")')
                ->pluck('count', 'type')
                ->toArray(),
            'recent' => $user->notifications()
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}
