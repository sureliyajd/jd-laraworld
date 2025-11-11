<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmailLogResource extends JsonResource
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
            'recipient_email' => $this->recipient_email,
            'recipient_name' => $this->recipient_name,
            'subject' => $this->subject,
            'body' => $this->body,
            'html_body' => $this->html_body, // Deprecated: kept for backward compatibility, body now supports HTML
            'status' => $this->status,
            'status_label' => ucfirst($this->status),
            'error_message' => $this->error_message,
            'sent_at' => $this->sent_at?->toISOString(),
            'sent_at_formatted' => $this->sent_at?->format('M j, Y H:i:s'),
            'sent_at_human' => $this->sent_at?->diffForHumans(),
            'metadata' => $this->metadata,
            'created_at' => $this->created_at->toISOString(),
            'created_at_formatted' => $this->created_at->format('M j, Y H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at' => $this->updated_at->toISOString(),

            // Relationships
            'sender' => $this->whenLoaded('sender', function () {
                return [
                    'id' => $this->sender->id,
                    'name' => $this->sender->name,
                    'email' => $this->sender->email,
                ];
            }),
            'mailer' => $this->whenLoaded('mailer', function () {
                return [
                    'id' => $this->mailer->id,
                    'name' => $this->mailer->name,
                    'provider' => $this->mailer->provider,
                ];
            }),
            'mailer_id' => $this->mailer_id,

            // Links for API navigation
            'links' => [
                'self' => url("/api/email-logs/{$this->id}"),
            ],
        ];
    }
}
