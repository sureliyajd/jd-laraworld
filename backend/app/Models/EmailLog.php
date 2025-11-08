<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailLog extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sent_by',
        'mailer_id',
        'recipient_email',
        'recipient_name',
        'subject',
        'body',
        'html_body',
        'status',
        'error_message',
        'sent_at',
        'metadata',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    /**
     * Get the user who sent the email
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    /**
     * Get the mailer used to send the email
     */
    public function mailer(): BelongsTo
    {
        return $this->belongsTo(Mailer::class);
    }

    /**
     * Scope a query to only include sent emails.
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope a query to only include failed emails.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include pending emails.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
