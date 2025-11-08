<?php

namespace App\Policies;

use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskCommentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view comments
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TaskComment $taskComment): bool
    {
        // Users can view comments if they can view the associated task
        return $user->can('view', $taskComment->task);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->checkPermission('view comments');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TaskComment $taskComment): bool
    {
        // System comments cannot be updated
        if ($taskComment->is_system_comment) {
            return false;
        }
        
        // Users with manage comments permission can update any comment
        if ($user->checkPermission('manage comments')) {
            return true;
        }
        
        // Users can only update their own comments
        return $user->id === $taskComment->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TaskComment $taskComment): bool
    {
        // System comments cannot be deleted by users
        if ($taskComment->is_system_comment) {
            return false;
        }
        
        // Users with manage comments permission can delete any comment
        if ($user->checkPermission('manage comments')) {
            return true;
        }
        
        // Users can only delete their own comments
        return $user->id === $taskComment->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TaskComment $taskComment): bool
    {
        return $user->id === $taskComment->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TaskComment $taskComment): bool
    {
        return $user->id === $taskComment->user_id;
    }

    /**
     * Determine whether the user can reply to the comment.
     */
    public function reply(User $user, TaskComment $taskComment): bool
    {
        // Users can reply to comments if they can add comments to the task
        return $user->can('addComment', $taskComment->task);
    }
}