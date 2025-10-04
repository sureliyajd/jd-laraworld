<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TaskAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'original_filename',
        'mime_type',
        'file_size',
        'file_path',
        'disk',
        'description',
        'is_public',
        'task_id',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_public' => 'boolean',
    ];

    /**
     * Get the task that owns the attachment
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the user who uploaded the attachment
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the direct file URL for viewing/preview
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get the preview URL (same as direct URL for public files)
     */
    public function getPreviewUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get the download URL (forces download)
     */
    public function getDownloadUrlAttribute(): string
    {
        return route('api.attachments.download', $this->id);
    }

    /**
     * Get the file extension
     */
    public function getExtensionAttribute(): string
    {
        return pathinfo($this->original_filename, PATHINFO_EXTENSION);
    }

    /**
     * Get the file size in human readable format
     */
    public function getHumanFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Check if the file is an image
     */
    public function getIsImageAttribute(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Check if the file is a document
     */
    public function getIsDocumentAttribute(): bool
    {
        $documentMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
        ];

        return in_array($this->mime_type, $documentMimes);
    }

    /**
     * Check if the file is an archive
     */
    public function getIsArchiveAttribute(): bool
    {
        $archiveMimes = [
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'application/gzip',
        ];

        return in_array($this->mime_type, $archiveMimes);
    }

    /**
     * Get the file icon class based on type
     */
    public function getIconClassAttribute(): string
    {
        if ($this->is_image) {
            return 'fas fa-image';
        }

        if ($this->is_document) {
            return match ($this->extension) {
                'pdf' => 'fas fa-file-pdf',
                'doc', 'docx' => 'fas fa-file-word',
                'xls', 'xlsx' => 'fas fa-file-excel',
                'txt' => 'fas fa-file-alt',
                default => 'fas fa-file',
            };
        }

        if ($this->is_archive) {
            return 'fas fa-file-archive';
        }

        return 'fas fa-file';
    }

    /**
     * Delete the physical file when the model is deleted
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($attachment) {
            if (Storage::disk($attachment->disk)->exists($attachment->file_path)) {
                Storage::disk($attachment->disk)->delete($attachment->file_path);
            }
        });
    }


    /**
     * Scope to get attachments by file type
     */
    public function scopeByType($query, $type)
    {
        return match ($type) {
            'image' => $query->where('mime_type', 'like', 'image/%'),
            'document' => $query->whereIn('mime_type', [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
            ]),
            'archive' => $query->whereIn('mime_type', [
                'application/zip',
                'application/x-rar-compressed',
                'application/x-7z-compressed',
                'application/gzip',
            ]),
            default => $query,
        };
    }
}