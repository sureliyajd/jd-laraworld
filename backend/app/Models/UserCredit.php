<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCredit extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'module',
        'credits',
        'used',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'credits' => 'integer',
            'used' => 'integer',
        ];
    }

    /**
     * Get the user that owns the credit.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the available credits (credits - used).
     */
    public function getAvailableAttribute(): int
    {
        return max(0, $this->credits - $this->used);
    }

    /**
     * Check if user has enough credits.
     */
    public function hasEnough(int $required = 1): bool
    {
        return $this->available >= $required;
    }

    /**
     * Consume credits.
     */
    public function consume(int $amount = 1): bool
    {
        if (!$this->hasEnough($amount)) {
            return false;
        }

        $this->increment('used', $amount);
        return true;
    }

    /**
     * Release credits (when task/email/user is deleted).
     */
    public function release(int $amount = 1): void
    {
        $this->decrement('used', $amount);
        // Ensure used doesn't go below 0
        if ($this->used < 0) {
            $this->update(['used' => 0]);
        }
    }
}
