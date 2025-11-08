<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view categories
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Category $category): bool
    {
        return true; // All authenticated users can view categories
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Users need permission to create tasks to create categories
        return $user->checkPermission('create tasks');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Category $category): bool
    {
        // Users need permission to edit tasks to update categories
        return $user->checkPermission('edit tasks');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Category $category): bool
    {
        // Users need permission to delete tasks to delete categories
        if (!$user->checkPermission('delete tasks')) {
            return false;
        }
        
        // Users can only delete categories that have no tasks
        return $category->tasks()->count() === 0;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Category $category): bool
    {
        return true; // All authenticated users can restore categories
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Category $category): bool
    {
        // Users can only permanently delete categories that have no tasks
        return $category->tasks()->count() === 0;
    }
}