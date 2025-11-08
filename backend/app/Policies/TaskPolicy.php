<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->checkPermission('view all tasks') || $user->checkPermission('view assigned tasks');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        // Users with "view all tasks" permission can view any task
        if ($user->checkPermission('view all tasks')) {
            return true;
        }
        
        // Users with "view assigned tasks" can only view tasks they're involved with
        if ($user->checkPermission('view assigned tasks')) {
            return $user->id === $task->created_by ||
                   $user->id === $task->assigned_to ||
                   $task->assignments()->where('user_id', $user->id)->exists();
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->checkPermission('create tasks');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        // Check permission to edit tasks
        if (!$user->checkPermission('edit tasks')) {
            return false;
        }
        
        // Users can update tasks if they:
        // 1. Created the task
        // 2. Are assigned to the task
        // 3. Are assigned as collaborator
        return $user->id === $task->created_by ||
               $user->id === $task->assigned_to ||
               $task->assignments()->where('user_id', $user->id)
                   ->whereIn('role', ['assignee', 'collaborator'])
                   ->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        // Check permission to delete tasks
        if (!$user->checkPermission('delete tasks')) {
            return false;
        }
        
        // Only the creator can delete tasks
        return $user->id === $task->created_by;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Task $task): bool
    {
        // Only the creator can restore deleted tasks
        return $user->id === $task->created_by;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Task $task): bool
    {
        // Only the creator can permanently delete tasks
        return $user->id === $task->created_by;
    }

    /**
     * Determine whether the user can assign the task to other users.
     */
    public function assign(User $user, Task $task): bool
    {
        // Check permission to assign tasks
        if (!$user->checkPermission('assign tasks')) {
            return false;
        }
        
        // Users can assign tasks if they:
        // 1. Created the task
        // 2. Are assigned to the task
        return $user->id === $task->created_by ||
               $user->id === $task->assigned_to;
    }

    /**
     * Determine whether the user can change the status of the task.
     */
    public function changeStatus(User $user, Task $task): bool
    {
        // Check permission to change task status
        if (!$user->checkPermission('change task status')) {
            return false;
        }
        
        // Users can change status if they:
        // 1. Created the task
        // 2. Are assigned to the task
        // 3. Are assigned as collaborator
        return $user->id === $task->created_by ||
               $user->id === $task->assigned_to ||
               $task->assignments()->where('user_id', $user->id)
                   ->whereIn('role', ['assignee', 'collaborator'])
                   ->exists();
    }

    /**
     * Determine whether the user can add comments to the task.
     */
    public function addComment(User $user, Task $task): bool
    {
        // Users can add comments if they can view the task and have permission
        return $user->checkPermission('view comments') && $this->view($user, $task);
    }

    /**
     * Determine whether the user can add attachments to the task.
     */
    public function addAttachment(User $user, Task $task): bool
    {
        // Users can add attachments if they can update the task and have permission
        return $user->checkPermission('manage attachments') && $this->update($user, $task);
    }
}