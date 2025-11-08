<?php

namespace App\Jobs;

use App\Models\Mailer;
use App\Models\User;
use App\Services\MailerService;
use App\Mail\CustomEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;
    public $backoff = [10, 30, 60]; // Retry after 10s, 30s, 60s

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $to,
        public string $subject,
        public string $body,
        public ?string $htmlBody = null,
        public ?string $recipientName = null,
        public ?array $cc = null,
        public ?array $bcc = null,
        public ?User $user = null,
        public ?Mailer $mailer = null,
        public ?int $emailLogId = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(MailerService $mailerService): void
    {
        try {
            Log::info('Processing SendEmailJob', [
                'to' => $this->to,
                'subject' => $this->subject,
                'mailer_id' => $this->mailer?->id,
                'user_id' => $this->user?->id,
            ]);

            // Get active mailer for user or use provided mailer
            $activeMailer = $this->mailer ?? ($this->user ? $mailerService->getActiveMailerForUser($this->user) : null);

            // Configure mailer if available
            if ($activeMailer) {
                $mailerService->useMailer($activeMailer);
                Log::info('Using configured mailer', [
                    'mailer_id' => $activeMailer->id,
                    'provider' => $activeMailer->provider,
                ]);
            } else {
                // Use default Laravel mail configuration
                $mailerService->useMailer(null);
                Log::info('Using default Laravel mail configuration');
            }

            // Create email
            $mail = new CustomEmail(
                subject: $this->subject,
                body: $this->body,
                htmlBody: $this->htmlBody,
                recipientName: $this->recipientName
            );

            $mail->to($this->to, $this->recipientName);

            // Add CC recipients
            if ($this->cc && is_array($this->cc)) {
                foreach ($this->cc as $ccEmail) {
                    $mail->cc($ccEmail);
                }
            }

            // Add BCC recipients
            if ($this->bcc && is_array($this->bcc)) {
                foreach ($this->bcc as $bccEmail) {
                    $mail->bcc($bccEmail);
                }
            }

            // Send email
            Mail::send($mail);

            // Update email log if provided
            if ($this->emailLogId) {
                $emailLog = \App\Models\EmailLog::find($this->emailLogId);
                if ($emailLog) {
                    $emailLog->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                        'mailer_id' => $activeMailer?->id,
                    ]);
                }
            }

            Log::info('Email sent successfully', [
                'to' => $this->to,
                'subject' => $this->subject,
                'mailer_id' => $activeMailer?->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send email', [
                'to' => $this->to,
                'subject' => $this->subject,
                'mailer_id' => $this->mailer?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Update email log if provided
            if ($this->emailLogId) {
                $emailLog = \App\Models\EmailLog::find($this->emailLogId);
                if ($emailLog) {
                    $emailLog->update([
                        'status' => 'failed',
                        'error_message' => $e->getMessage(),
                    ]);
                }
            }

            throw $e; // Re-throw to trigger retry mechanism
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendEmailJob failed permanently', [
            'to' => $this->to,
            'subject' => $this->subject,
            'mailer_id' => $this->mailer?->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);

        // Update email log if provided
        if ($this->emailLogId) {
            $emailLog = \App\Models\EmailLog::find($this->emailLogId);
            if ($emailLog) {
                $emailLog->update([
                    'status' => 'failed',
                    'error_message' => $exception->getMessage(),
                ]);
            }
        }
    }
}
