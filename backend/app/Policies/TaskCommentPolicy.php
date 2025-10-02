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
        return true; // All authenticated users can create comments
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TaskComment $taskComment): bool
    {
        // Users can only update their own comments
        // System comments cannot be updated
        return $user->id === $taskComment->user_id && !$taskComment->is_system_comment;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TaskComment $taskComment): bool
    {
        // Users can delete their own comments
        // System comments cannot be deleted by users
        return $user->id === $taskComment->user_id && !$taskComment->is_system_comment;
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