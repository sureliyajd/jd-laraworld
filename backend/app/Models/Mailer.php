<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Crypt;

class Mailer extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'provider',
        'is_active',
        'credentials',
        'from_address',
        'from_name',
        'test_status',
        'test_error',
        'last_tested_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'test_status' => 'boolean',
            'last_tested_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the mailer.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the decrypted credentials.
     */
    protected function credentials(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => json_decode(Crypt::decryptString($value), true),
            set: fn (array $value) => Crypt::encryptString(json_encode($value)),
        );
    }

    /**
     * Scope a query to only include active mailers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include tested mailers.
     */
    public function scopeTested($query)
    {
        return $query->where('test_status', true);
    }

    /**
     * Get the active mailer for a user.
     */
    public static function getActiveForUser(int $userId): ?self
    {
        return self::where('user_id', $userId)
            ->where('is_active', true)
            ->where('test_status', true)
            ->first();
    }
}
