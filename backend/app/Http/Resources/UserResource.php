<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'parent_id' => $this->parent_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'roles' => $this->when($this->relationLoaded('roles'), function () {
                return $this->roles->pluck('name')->toArray();
            }),
            'role' => $this->when($this->relationLoaded('roles'), function () {
                return $this->roles->first()?->name;
            }),
            'task_stats' => $this->when($request->get('include_stats'), $this->task_stats),
            'created_tasks_count' => $this->when($request->get('include_counts'), $this->createdTasks()->count()),
            'assigned_tasks_count' => $this->when($request->get('include_counts'), $this->assignedTasks()->count()),
            'completed_tasks_count' => $this->when($request->get('include_counts'), $this->assignedTasks()->where('status', 'completed')->count()),
            'credits' => $this->when($this->relationLoaded('credits'), function () {
                return $this->credits->mapWithKeys(function ($credit) {
                    return [$credit->module => [
                        'credits' => $credit->credits,
                        'used' => $credit->used,
                        'available' => $credit->available,
                    ]];
                });
            }),
            'credit_stats' => $this->when($request->get('include_credit_stats'), $this->getCreditStats()),
            'permissions' => $this->when($request->get('include_permissions', true), function () {
                return $this->getAllPermissions()->pluck('name')->toArray();
            }),
        ];
    }
}
