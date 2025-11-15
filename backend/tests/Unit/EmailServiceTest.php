<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\EmailService;
use App\Models\User;
use App\Models\Mailer;
use App\Models\EmailLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Mail;

class EmailServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Queue::fake();
    }

    /** @test */
    public function it_can_send_email_to_single_recipient()
    {
        $user = User::factory()->create();

        $emailLog = EmailService::send(
            'test@example.com',
            'Test Subject',
            'Test Body',
            ['user' => $user, 'queue' => false]
        );

        $this->assertInstanceOf(EmailLog::class, $emailLog);
        $this->assertEquals('test@example.com', $emailLog->recipient_email);
        $this->assertEquals('Test Subject', $emailLog->subject);
    }

    /** @test */
    public function it_can_send_email_to_multiple_recipients()
    {
        $user = User::factory()->create();

        $emailLog = EmailService::send(
            ['test1@example.com', 'test2@example.com'],
            'Test Subject',
            'Test Body',
            ['user' => $user, 'queue' => false]
        );

        $this->assertInstanceOf(EmailLog::class, $emailLog);
        $this->assertCount(2, EmailLog::where('subject', 'Test Subject')->get());
    }

    /** @test */
    public function it_can_send_email_with_cc_and_bcc()
    {
        $user = User::factory()->create();

        $emailLog = EmailService::send(
            'test@example.com',
            'Test Subject',
            'Test Body',
            [
                'user' => $user,
                'cc' => 'cc@example.com',
                'bcc' => 'bcc@example.com',
                'queue' => false
            ]
        );

        $this->assertNotNull($emailLog);
        $metadata = $emailLog->metadata;
        $this->assertEquals('cc@example.com', $metadata['cc']);
        $this->assertEquals('bcc@example.com', $metadata['bcc']);
    }

    /** @test */
    public function it_can_send_email_with_recipient_name()
    {
        $user = User::factory()->create();

        $emailLog = EmailService::send(
            'test@example.com',
            'Test Subject',
            'Test Body',
            [
                'user' => $user,
                'recipient_name' => 'John Doe',
                'queue' => false
            ]
        );

        $this->assertEquals('John Doe', $emailLog->recipient_name);
    }

    /** @test */
    public function it_can_send_email_synchronously()
    {
        $user = User::factory()->create();

        $emailLog = EmailService::send(
            'test@example.com',
            'Test Subject',
            'Test Body',
            ['user' => $user, 'sync' => true]
        );

        $this->assertNotNull($emailLog);
    }

    /** @test */
    public function it_can_send_email_without_logging()
    {
        $user = User::factory()->create();

        $emailLog = EmailService::send(
            'test@example.com',
            'Test Subject',
            'Test Body',
            ['user' => $user, 'log' => false, 'queue' => false]
        );

        $this->assertNull($emailLog);
    }

    /** @test */
    public function it_can_use_send_to_helper_method()
    {
        $user = User::factory()->create();

        $emailLog = EmailService::sendTo(
            'test@example.com',
            'Test Subject',
            'Test Body',
            $user,
            null,
            ['queue' => false]
        );

        $this->assertInstanceOf(EmailLog::class, $emailLog);
    }

    /** @test */
    public function it_can_use_send_to_many_helper_method()
    {
        $user = User::factory()->create();

        $emailLogs = EmailService::sendToMany(
            ['test1@example.com', 'test2@example.com'],
            'Test Subject',
            'Test Body',
            $user,
            null,
            ['queue' => false]
        );

        $this->assertCount(2, $emailLogs);
    }

    /** @test */
    public function it_can_send_email_with_custom_mailer()
    {
        $user = User::factory()->create();
        $mailer = Mailer::factory()->create(['user_id' => $user->id]);

        $emailLog = EmailService::send(
            'test@example.com',
            'Test Subject',
            'Test Body',
            ['user' => $user, 'mailer' => $mailer, 'queue' => false]
        );

        $this->assertNotNull($emailLog);
    }
}

