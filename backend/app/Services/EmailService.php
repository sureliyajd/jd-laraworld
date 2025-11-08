<?php

namespace App\Services;

use App\Jobs\SendEmailJob;
use App\Models\Mailer;
use App\Models\User;
use App\Models\EmailLog;
use Illuminate\Support\Facades\DB;

class EmailService
{
    /**
     * Send an email using the configured mailer.
     * This is a simple one-line interface for sending emails.
     *
     * @param string|array $to Recipient email(s)
     * @param string $subject Email subject
     * @param string $body Email body (plain text)
     * @param string|null $htmlBody HTML body (optional)
     * @param array $options Additional options (cc, bcc, recipientName, user, mailer, queue, sync)
     * @return EmailLog|null
     */
    public static function send(
        string|array $to,
        string $subject,
        string $body,
        ?string $htmlBody = null,
        array $options = []
    ): ?EmailLog {
        // Extract options
        $cc = $options['cc'] ?? null;
        $bcc = $options['bcc'] ?? null;
        $recipientName = $options['recipient_name'] ?? null;
        $user = $options['user'] ?? null;
        $mailer = $options['mailer'] ?? null;
        $queue = $options['queue'] ?? true;
        $sync = $options['sync'] ?? false;
        $logEmail = $options['log'] ?? true;

        // Handle multiple recipients
        if (is_array($to)) {
            $emailLogs = [];
            foreach ($to as $email) {
                $emailLogs[] = self::send(
                    $email,
                    $subject,
                    $body,
                    $htmlBody,
                    array_merge($options, ['log' => $logEmail])
                );
            }
            return $emailLogs[0] ?? null; // Return first log for compatibility
        }

        // Create email log if logging is enabled
        $emailLog = null;
        if ($logEmail && $user) {
            try {
                $emailLog = EmailLog::create([
                    'sent_by' => $user->id,
                    'recipient_email' => $to,
                    'recipient_name' => $recipientName,
                    'subject' => $subject,
                    'body' => $body,
                    'html_body' => $htmlBody,
                    'status' => 'pending',
                    'metadata' => [
                        'cc' => $cc,
                        'bcc' => $bcc,
                    ],
                ]);
            } catch (\Exception $e) {
                // Log error but continue with email sending
                \Illuminate\Support\Facades\Log::error('Failed to create email log', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Dispatch job or send synchronously
        if ($sync || !$queue) {
            // Send synchronously by running the job immediately
            $job = new SendEmailJob(
                $to,
                $subject,
                $body,
                $htmlBody,
                $recipientName,
                $cc,
                $bcc,
                $user,
                $mailer,
                $emailLog?->id
            );
            $mailerService = app(\App\Services\MailerService::class);
            $job->handle($mailerService);
        } else {
            // Dispatch to queue
            SendEmailJob::dispatch(
                $to,
                $subject,
                $body,
                $htmlBody,
                $recipientName,
                $cc,
                $bcc,
                $user,
                $mailer,
                $emailLog?->id
            );
        }

        return $emailLog;
    }

    /**
     * Send email to a single recipient.
     */
    public static function sendTo(
        string $to,
        string $subject,
        string $body,
        ?string $htmlBody = null,
        ?User $user = null,
        ?Mailer $mailer = null,
        array $options = []
    ): ?EmailLog {
        return self::send($to, $subject, $body, $htmlBody, array_merge($options, [
            'user' => $user,
            'mailer' => $mailer,
        ]));
    }

    /**
     * Send email to multiple recipients.
     */
    public static function sendToMany(
        array $to,
        string $subject,
        string $body,
        ?string $htmlBody = null,
        ?User $user = null,
        ?Mailer $mailer = null,
        array $options = []
    ): array {
        $emailLogs = [];
        foreach ($to as $email) {
            $emailLogs[] = self::send($email, $subject, $body, $htmlBody, array_merge($options, [
                'user' => $user,
                'mailer' => $mailer,
            ]));
        }
        return array_filter($emailLogs);
    }
}

