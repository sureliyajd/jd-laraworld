<?php

namespace App\Services;

use App\Models\Mailer;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Exception;

class MailerService
{
    /**
     * Get supported mail providers.
     */
    public static function getSupportedProviders(): array
    {
        return [
            'smtp' => [
                'name' => 'SMTP',
                'fields' => [
                    'host' => ['required' => true, 'type' => 'string'],
                    'port' => ['required' => true, 'type' => 'integer'],
                    'username' => ['required' => false, 'type' => 'string'],
                    'password' => ['required' => false, 'type' => 'string'],
                    'encryption' => ['required' => false, 'type' => 'string', 'options' => ['tls', 'ssl', null]],
                    'timeout' => ['required' => false, 'type' => 'integer'],
                ],
            ],
            'mailgun' => [
                'name' => 'Mailgun',
                'fields' => [
                    'domain' => ['required' => true, 'type' => 'string'],
                    'secret' => ['required' => true, 'type' => 'string'],
                    'endpoint' => ['required' => false, 'type' => 'string'],
                ],
            ],
            'ses' => [
                'name' => 'AWS SES',
                'fields' => [
                    'key' => ['required' => true, 'type' => 'string'],
                    'secret' => ['required' => true, 'type' => 'string'],
                    'region' => ['required' => true, 'type' => 'string'],
                ],
            ],
            'postmark' => [
                'name' => 'Postmark',
                'fields' => [
                    'token' => ['required' => true, 'type' => 'string'],
                ],
            ],
            'resend' => [
                'name' => 'Resend',
                'fields' => [
                    'key' => ['required' => true, 'type' => 'string'],
                ],
            ],
            'sendmail' => [
                'name' => 'Sendmail',
                'fields' => [
                    'path' => ['required' => false, 'type' => 'string'],
                ],
            ],
            'log' => [
                'name' => 'Log (Development)',
                'fields' => [],
            ],
        ];
    }

    /**
     * Configure Laravel mail settings for a specific mailer.
     */
    public function configureMailer(Mailer $mailer): void
    {
        $provider = $mailer->provider;
        $credentials = $mailer->credentials;
        $fromAddress = $mailer->from_address ?? config('mail.from.address');
        $fromName = $mailer->from_name ?? config('mail.from.name');

        // Set default from address
        Config::set('mail.from.address', $fromAddress);
        Config::set('mail.from.name', $fromName);

        // Configure based on provider
        switch ($provider) {
            case 'smtp':
                $this->configureSmtp($credentials);
                break;
            case 'mailgun':
                $this->configureMailgun($credentials);
                break;
            case 'ses':
                $this->configureSes($credentials);
                break;
            case 'postmark':
                $this->configurePostmark($credentials);
                break;
            case 'resend':
                $this->configureResend($credentials);
                break;
            case 'sendmail':
                $this->configureSendmail($credentials);
                break;
            case 'log':
                $this->configureLog();
                break;
        }

        // Set the default mailer
        Config::set('mail.default', $provider);
    }

    /**
     * Configure SMTP mailer.
     */
    protected function configureSmtp(array $credentials): void
    {
        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'host' => $credentials['host'] ?? null,
            'port' => $credentials['port'] ?? 587,
            'username' => $credentials['username'] ?? null,
            'password' => $credentials['password'] ?? null,
            'encryption' => $credentials['encryption'] ?? 'tls',
            'timeout' => $credentials['timeout'] ?? null,
            'local_domain' => config('mail.mailers.smtp.local_domain'),
        ]);
    }

    /**
     * Configure Mailgun mailer.
     */
    protected function configureMailgun(array $credentials): void
    {
        Config::set('services.mailgun.domain', $credentials['domain'] ?? null);
        Config::set('services.mailgun.secret', $credentials['secret'] ?? null);
        Config::set('services.mailgun.endpoint', $credentials['endpoint'] ?? 'api.mailgun.net');
        
        Config::set('mail.mailers.mailgun', [
            'transport' => 'mailgun',
        ]);
    }

    /**
     * Configure AWS SES mailer.
     */
    protected function configureSes(array $credentials): void
    {
        Config::set('services.ses.key', $credentials['key'] ?? null);
        Config::set('services.ses.secret', $credentials['secret'] ?? null);
        Config::set('services.ses.region', $credentials['region'] ?? 'us-east-1');
        
        Config::set('mail.mailers.ses', [
            'transport' => 'ses',
        ]);
    }

    /**
     * Configure Postmark mailer.
     */
    protected function configurePostmark(array $credentials): void
    {
        Config::set('services.postmark.token', $credentials['token'] ?? null);
        
        Config::set('mail.mailers.postmark', [
            'transport' => 'postmark',
        ]);
    }

    /**
     * Configure Resend mailer.
     */
    protected function configureResend(array $credentials): void
    {
        Config::set('services.resend.key', $credentials['key'] ?? null);
        
        Config::set('mail.mailers.resend', [
            'transport' => 'resend',
        ]);
    }

    /**
     * Configure Sendmail mailer.
     */
    protected function configureSendmail(array $credentials): void
    {
        Config::set('mail.mailers.sendmail', [
            'transport' => 'sendmail',
            'path' => $credentials['path'] ?? '/usr/sbin/sendmail -bs -i',
        ]);
    }

    /**
     * Configure Log mailer (for development).
     */
    protected function configureLog(): void
    {
        Config::set('mail.mailers.log', [
            'transport' => 'log',
            'channel' => config('mail.log_channel'),
        ]);
    }

    /**
     * Test mailer configuration by sending a test email.
     */
    public function testMailer(Mailer $mailer, string $testEmail): array
    {
        // Store original config to restore later
        $originalDefault = config('mail.default');
        $originalFromAddress = config('mail.from.address');
        $originalFromName = config('mail.from.name');
        
        try {
            // Configure the mailer
            $this->configureMailer($mailer);

            // Create a test email using CustomEmail mailable
            $testMail = new \App\Mail\CustomEmail(
                subject: 'Test Email - ' . $mailer->name,
                body: 'This is a test email from your mailer configuration. If you received this, your mailer is working correctly!',
                htmlBody: null,
                recipientName: null
            );

            $testMail->to($testEmail);

            // Send test email
            Mail::send($testMail);

            // Restore original config
            Config::set('mail.default', $originalDefault);
            Config::set('mail.from.address', $originalFromAddress);
            Config::set('mail.from.name', $originalFromName);

            return [
                'success' => true,
                'message' => 'Test email sent successfully',
            ];
        } catch (Exception $e) {
            // Restore original config even on error
            Config::set('mail.default', $originalDefault);
            Config::set('mail.from.address', $originalFromAddress);
            Config::set('mail.from.name', $originalFromName);
            
            Log::error('Mailer test failed', [
                'mailer_id' => $mailer->id ?? null,
                'provider' => $mailer->provider ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send test email',
                'error' => $e->getMessage(),
                'raw_error' => $e->getTraceAsString(),
            ];
        }
    }

    /**
     * Get active mailer for user or use default.
     */
    public function getActiveMailerForUser(?User $user = null): ?Mailer
    {
        if ($user) {
            return Mailer::getActiveForUser($user->id);
        }

        return null;
    }

    /**
     * Use mailer for sending email.
     */
    public function useMailer(?Mailer $mailer = null): void
    {
        if ($mailer) {
            $this->configureMailer($mailer);
        } else {
            // Use default Laravel configuration
            // Reset to default mail configuration from .env
            $defaultMailer = env('MAIL_MAILER', 'log');
            Config::set('mail.default', $defaultMailer);
            
            // Reset from address to default
            Config::set('mail.from.address', env('MAIL_FROM_ADDRESS', 'hello@example.com'));
            Config::set('mail.from.name', env('MAIL_FROM_NAME', 'Example'));
        }
    }
}

