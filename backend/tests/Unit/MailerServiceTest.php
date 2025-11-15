<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\MailerService;
use App\Models\Mailer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class MailerServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    /** @test */
    public function it_returns_supported_providers()
    {
        $providers = MailerService::getSupportedProviders();

        $this->assertArrayHasKey('smtp', $providers);
        $this->assertArrayHasKey('mailgun', $providers);
        $this->assertArrayHasKey('ses', $providers);
        $this->assertArrayHasKey('postmark', $providers);
        $this->assertArrayHasKey('resend', $providers);
        $this->assertArrayHasKey('sendmail', $providers);
        $this->assertArrayHasKey('log', $providers);
    }

    /** @test */
    public function it_can_configure_smtp_mailer()
    {
        $user = User::factory()->create();
        $mailer = Mailer::create([
            'user_id' => $user->id,
            'name' => 'Test SMTP',
            'provider' => 'smtp',
            'credentials' => [
                'host' => 'smtp.example.com',
                'port' => 587,
                'username' => 'user@example.com',
                'password' => 'password',
                'encryption' => 'tls',
            ],
            'from_address' => 'test@example.com',
            'from_name' => 'Test',
        ]);

        $service = new MailerService();
        $service->configureMailer($mailer);

        $this->assertEquals('smtp', Config::get('mail.default'));
        $this->assertEquals('test@example.com', Config::get('mail.from.address'));
    }

    /** @test */
    public function it_can_configure_mailgun_mailer()
    {
        $user = User::factory()->create();
        $mailer = Mailer::create([
            'user_id' => $user->id,
            'name' => 'Test Mailgun',
            'provider' => 'mailgun',
            'credentials' => [
                'domain' => 'mg.example.com',
                'secret' => 'secret-key',
            ],
        ]);

        $service = new MailerService();
        $service->configureMailer($mailer);

        $this->assertEquals('mailgun', Config::get('mail.default'));
        $this->assertEquals('mg.example.com', Config::get('services.mailgun.domain'));
    }

    /** @test */
    public function it_can_configure_ses_mailer()
    {
        $user = User::factory()->create();
        $mailer = Mailer::create([
            'user_id' => $user->id,
            'name' => 'Test SES',
            'provider' => 'ses',
            'credentials' => [
                'key' => 'aws-key',
                'secret' => 'aws-secret',
                'region' => 'us-east-1',
            ],
        ]);

        $service = new MailerService();
        $service->configureMailer($mailer);

        $this->assertEquals('ses', Config::get('mail.default'));
        $this->assertEquals('aws-key', Config::get('services.ses.key'));
    }

    /** @test */
    public function it_can_configure_postmark_mailer()
    {
        $user = User::factory()->create();
        $mailer = Mailer::create([
            'user_id' => $user->id,
            'name' => 'Test Postmark',
            'provider' => 'postmark',
            'credentials' => [
                'token' => 'postmark-token',
            ],
        ]);

        $service = new MailerService();
        $service->configureMailer($mailer);

        $this->assertEquals('postmark', Config::get('mail.default'));
        $this->assertEquals('postmark-token', Config::get('services.postmark.token'));
    }

    /** @test */
    public function it_can_configure_resend_mailer()
    {
        $user = User::factory()->create();
        $mailer = Mailer::create([
            'user_id' => $user->id,
            'name' => 'Test Resend',
            'provider' => 'resend',
            'credentials' => [
                'key' => 'resend-key',
            ],
        ]);

        $service = new MailerService();
        $service->configureMailer($mailer);

        $this->assertEquals('resend', Config::get('mail.default'));
        $this->assertEquals('resend-key', Config::get('services.resend.key'));
    }

    /** @test */
    public function it_can_configure_log_mailer()
    {
        $user = User::factory()->create();
        $mailer = Mailer::create([
            'user_id' => $user->id,
            'name' => 'Test Log',
            'provider' => 'log',
            'credentials' => [],
        ]);

        $service = new MailerService();
        $service->configureMailer($mailer);

        $this->assertEquals('log', Config::get('mail.default'));
    }

    /** @test */
    public function it_can_get_active_mailer_for_user()
    {
        $user = User::factory()->create();
        $activeMailer = Mailer::create([
            'user_id' => $user->id,
            'name' => 'Active Mailer',
            'provider' => 'log',
            'is_active' => true,
            'test_status' => true,
            'credentials' => [],
        ]);
        Mailer::create([
            'user_id' => $user->id,
            'name' => 'Inactive Mailer',
            'provider' => 'log',
            'is_active' => false,
            'credentials' => [],
        ]);

        $service = new MailerService();
        $mailer = $service->getActiveMailerForUser($user);

        $this->assertNotNull($mailer);
        $this->assertEquals($activeMailer->id, $mailer->id);
    }

    /** @test */
    public function it_returns_null_if_no_active_mailer_for_user()
    {
        $user = User::factory()->create();

        $service = new MailerService();
        $mailer = $service->getActiveMailerForUser($user);

        $this->assertNull($mailer);
    }
}

