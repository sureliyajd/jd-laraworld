# Mailer Management System - Usage Guide

## Overview

This mailer management system allows users to configure and manage multiple email service providers (SMTP, Mailgun, AWS SES, Postmark, Resend, etc.) with a simple interface. Emails are sent through a job queue system that automatically uses the user's active mailer configuration.

## Features

- ✅ Support for multiple mail providers (SMTP, Mailgun, AWS SES, Postmark, Resend, Sendmail, Log)
- ✅ User-specific mailer configurations
- ✅ Automatic test email on save to verify credentials
- ✅ Active mailer management (one active mailer per user)
- ✅ Encrypted credential storage
- ✅ Job-based email sending with automatic mailer selection
- ✅ Simple one-line email sending interface
- ✅ Email logging with mailer tracking

## API Endpoints

### Mailer Management

- `GET /api/mailers` - List all mailers for the authenticated user
- `GET /api/mailers/{id}` - Get a specific mailer
- `POST /api/mailers` - Create a new mailer (tests automatically)
- `PUT /api/mailers/{id}` - Update a mailer (tests automatically if credentials change)
- `DELETE /api/mailers/{id}` - Delete a mailer
- `GET /api/mailers/providers/list` - Get list of supported providers with their required fields
- `POST /api/mailers/{id}/test` - Test a mailer configuration
- `POST /api/mailers/{id}/activate` - Activate a mailer (deactivates others)
- `POST /api/mailers/{id}/deactivate` - Deactivate a mailer

### Email Sending

Emails are automatically sent using the user's active mailer (or default Laravel config if no active mailer).

## Usage Examples

### 1. Create a Mailer (SMTP Example)

```json
POST /api/mailers
{
    "name": "My SMTP Mailer",
    "provider": "smtp",
    "credentials": {
        "host": "smtp.mailtrap.io",
        "port": 2525,
        "username": "your-username",
        "password": "your-password",
        "encryption": "tls"
    },
    "from_address": "noreply@example.com",
    "from_name": "My App",
    "is_active": true
}
```

### 2. Create a Mailer (Mailgun Example)

```json
POST /api/mailers
{
    "name": "My Mailgun Mailer",
    "provider": "mailgun",
    "credentials": {
        "domain": "mg.example.com",
        "secret": "your-mailgun-secret",
        "endpoint": "api.mailgun.net"
    },
    "from_address": "noreply@example.com",
    "from_name": "My App",
    "is_active": true
}
```

### 3. Create a Mailer (AWS SES Example)

```json
POST /api/mailers
{
    "name": "My AWS SES Mailer",
    "provider": "ses",
    "credentials": {
        "key": "your-aws-access-key",
        "secret": "your-aws-secret-key",
        "region": "us-east-1"
    },
    "from_address": "noreply@example.com",
    "from_name": "My App",
    "is_active": true
}
```

### 4. Send Email Using EmailService (Simple Interface)

```php
use App\Services\EmailService;
use App\Models\User;

// Get the authenticated user
$user = auth()->user();

// Send a simple email (uses active mailer automatically)
EmailService::send(
    'recipient@example.com',
    'Subject',
    'Plain text body',
    '<p>HTML body</p>',
    [
        'user' => $user,
        'recipient_name' => 'John Doe',
        'cc' => ['cc@example.com'],
        'bcc' => ['bcc@example.com'],
    ]
);

// Send email synchronously (without queue)
EmailService::send(
    'recipient@example.com',
    'Subject',
    'Plain text body',
    '<p>HTML body</p>',
    [
        'user' => $user,
        'sync' => true, // Send immediately
    ]
);

// Send to multiple recipients
EmailService::sendToMany(
    ['user1@example.com', 'user2@example.com'],
    'Subject',
    'Plain text body',
    '<p>HTML body</p>',
    $user
);
```

### 5. Send Email Using Job Directly

```php
use App\Jobs\SendEmailJob;
use App\Models\User;
use App\Models\Mailer;

$user = auth()->user();
$mailer = Mailer::find(1); // Optional: specify a mailer

// Dispatch email job
SendEmailJob::dispatch(
    'recipient@example.com',
    'Subject',
    'Plain text body',
    '<p>HTML body</p>',
    'Recipient Name',
    ['cc@example.com'], // CC
    ['bcc@example.com'], // BCC
    $user,
    $mailer, // null to use active mailer
    null // email_log_id (optional)
);
```

### 6. Send Email via API (EmailLogController)

```json
POST /api/email-logs
{
    "recipient_email": "recipient@example.com",
    "recipient_name": "John Doe",
    "subject": "Test Email",
    "body": "<p>Email body (supports both plain text and HTML)</p>",
    "cc": ["cc@example.com"],
    "bcc": ["bcc@example.com"]
}
```

Note: The `body` field now supports both plain text and HTML. If HTML tags are detected, the email will be sent as HTML. Otherwise, it will be sent as plain text.

## Supported Providers

### SMTP
- Required fields: `host`, `port`
- Optional fields: `username`, `password`, `encryption` (tls/ssl), `timeout`

### Mailgun
- Required fields: `domain`, `secret`
- Optional fields: `endpoint` (default: api.mailgun.net)

**Note:** Requires `symfony/mailgun-mailer` package:
```bash
composer require symfony/mailgun-mailer symfony/http-client
```

### AWS SES
- Required fields: `key`, `secret`, `region`
- Optional fields: none

**Note:** Requires AWS SDK:
```bash
composer require aws/aws-sdk-php
```

### Postmark
- Required fields: `token`
- Optional fields: none

**Note:** Requires Postmark package:
```bash
composer require symfony/postmark-mailer symfony/http-client
```

### Resend
- Required fields: `key`
- Optional fields: none

**Note:** Requires Resend package:
```bash
composer require resend/resend-php
```

### Sendmail
- Required fields: none
- Optional fields: `path` (default: /usr/sbin/sendmail -bs -i)

### Log (Development)
- Required fields: none
- Optional fields: none

## How It Works

1. **User creates a mailer** with provider and credentials
2. **System tests the mailer** automatically by sending a test email
3. **If test succeeds**, mailer is saved with `test_status = true`
4. **User activates the mailer** (only one active mailer per user)
5. **When sending emails**, the system:
   - Checks for active mailer for the user
   - Configures Laravel mail settings dynamically
   - Sends email using the configured mailer
   - Falls back to default Laravel config if no active mailer

## Security

- Credentials are encrypted using Laravel's encryption
- Credentials are never exposed in API responses
- Only the mailer owner can manage their mailers
- Test emails are sent to verify credentials before saving

## Error Handling

- Test emails show raw errors if credentials are invalid
- Email sending failures are logged in email_logs table
- Job retries up to 3 times with exponential backoff
- Failed emails are tracked with error messages

## Queue Configuration

Make sure your queue worker is running:

```bash
php artisan queue:work
```

Or for development:

```bash
php artisan queue:listen
```

## Notes

- Only one mailer can be active per user at a time
- Activating a mailer automatically deactivates others
- Test email is sent automatically when creating/updating mailers
- If test fails, mailer is still saved but marked as untested
- Emails are sent asynchronously via job queue by default
- Email logs track which mailer was used for each email

