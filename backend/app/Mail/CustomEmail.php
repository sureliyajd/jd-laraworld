<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomEmail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        string $subject,
        public string $body,
        public ?string $recipientName = null
    ) {
        $this->subject = $subject;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    /**
     * Check if body contains HTML tags.
     */
    private function isHtml(string $text): bool
    {
        return $text !== strip_tags($text);
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // If body contains HTML, use it as HTML content
        if ($this->isHtml($this->body)) {
            return new Content(
                htmlString: $this->body,
            );
        }

        // Otherwise, use plain text view
        return new Content(
            text: 'emails.plain-text',
            with: [
                'body' => $this->body,
                'recipientName' => $this->recipientName,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
