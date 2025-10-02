<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'is_system_comment',
        'metadata',
        'task_id',
        'user_id',
        'parent_comment_id',
    ];

    protected $casts = [
        'is_system_comment' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the task that owns the comment
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the user who wrote the comment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment (for nested comments)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(TaskComment::class, 'parent_comment_id');
    }

    /**
     * Get the replies to this comment
     */
    public function replies(): HasMany
    {
        return $this->hasMany(TaskComment::class, 'parent_comment_id');
    }

    /**
     * Scope to get only user comments (not system comments)
     */
    public function scopeUserComments($query)
    {
        return $query->where('is_system_comment', false);
    }

    /**
     * Scope to get only system comments
     */
    public function scopeSystemComments($query)
    {
        return $query->where('is_system_comment', true);
    }

    /**
     * Scope to get root comments (not replies)
     */
    public function scopeRootComments($query)
    {
        return $query->whereNull('parent_comment_id');
    }

    /**
     * Create a system comment for task events
     */
    public static function createSystemComment(Task $task, User $user, string $action, array $metadata = []): self
    {
        $messages = [
            'status_changed' => 'Status changed to :status',
            'priority_changed' => 'Priority changed to :priority',
            'assigned' => 'Task assigned to :assignee',
            'due_date_changed' => 'Due date changed to :due_date',
            'created' => 'Task created',
            'updated' => 'Task updated',
        ];

        $message = $messages[$action] ?? 'Task updated';
        
        // Replace placeholders with actual values
        foreach ($metadata as $key => $value) {
            $message = str_replace(":$key", $value, $message);
        }

        return self::create([
            'content' => $message,
            'is_system_comment' => true,
            'metadata' => array_merge(['action' => $action], $metadata),
            'task_id' => $task->id,
            'user_id' => $user->id,
        ]);
    }

    /**
     * Get the comment author name
     */
    public function getAuthorNameAttribute(): string
    {
        return $this->user ? $this->user->name : 'System';
    }

    /**
     * Get formatted content with mentions and links
     */
    public function getFormattedContentAttribute(): string
    {
        $content = $this->content;

        // Convert @mentions to links (basic implementation)
        $content = preg_replace('/@(\w+)/', '<a href="#" class="mention">@$1</a>', $content);

        // Convert URLs to links
        $content = preg_replace(
            '/(https?:\/\/[^\s]+)/',
            '<a href="$1" target="_blank" rel="noopener">$1</a>',
            $content
        );

        // Convert line breaks to HTML
        $content = nl2br($content);

        return $content;
    }
}