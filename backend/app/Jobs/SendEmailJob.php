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
                    'from_address' => $activeMailer->from_address,
                ]);
            } else {
                // Use default Laravel mail configuration
                $mailerService->useMailer(null);
                $defaultMailer = config('mail.default');
                Log::info('Using default Laravel mail configuration', [
                    'mailer' => $defaultMailer,
                    'from_address' => config('mail.from.address'),
                    'from_name' => config('mail.from.name'),
                ]);
            }

            // Log current mail configuration for debugging
            $currentMailer = config('mail.default');
            Log::info('Current mail configuration', [
                'default_mailer' => $currentMailer,
                'smtp_host' => config('mail.mailers.smtp.host'),
                'smtp_port' => config('mail.mailers.smtp.port'),
                'smtp_username' => config('mail.mailers.smtp.username') ? '***' : null,
                'smtp_encryption' => config('mail.mailers.smtp.encryption'),
            ]);

            // Warn if using log mailer (emails won't actually be sent)
            if ($currentMailer === 'log') {
                Log::warning('Using log mailer - emails will be logged but not actually sent', [
                    'to' => $this->to,
                    'subject' => $this->subject,
                ]);
            }

            // Create email
            $mail = new CustomEmail(
                subject: $this->subject,
                body: $this->body,
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

            // Send email with explicit error handling
            try {
                // Send using the configured default mailer
                // Mail::send() will use the default mailer configured above
                Mail::send($mail);
                
                // Note: Mail::failures() only works with SwiftMailer (Laravel < 9)
                // For Laravel 9+, exceptions are thrown directly
                // Check if we're using log mailer (emails logged but not sent)
                if ($currentMailer === 'log') {
                    Log::info('Email logged (log mailer) - check storage/logs/laravel.log for email content', [
                        'to' => $this->to,
                        'subject' => $this->subject,
                    ]);
                }

                Log::info('Email sent successfully', [
                    'to' => $this->to,
                    'subject' => $this->subject,
                    'mailer_id' => $activeMailer?->id,
                    'mailer_type' => config('mail.default'),
                ]);

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
            } catch (\Symfony\Component\Mailer\Exception\TransportExceptionInterface $e) {
                // Catch Symfony Mailer transport errors (Laravel 9+)
                Log::error('Mail Transport Exception', [
                    'to' => $this->to,
                    'error' => $e->getMessage(),
                    'code' => $e->getCode(),
                    'class' => get_class($e),
                ]);
                throw $e;
            } catch (\Exception $e) {
                // Catch any other mail sending errors
                Log::error('Mail sending exception', [
                    'to' => $this->to,
                    'error' => $e->getMessage(),
                    'class' => get_class($e),
                    'trace' => substr($e->getTraceAsString(), 0, 500), // Limit trace length
                ]);
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Failed to send email', [
                'to' => $this->to,
                'subject' => $this->subject,
                'mailer_id' => $this->mailer?->id,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
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
