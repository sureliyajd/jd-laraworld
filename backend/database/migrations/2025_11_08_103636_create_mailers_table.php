<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mailers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name'); // Friendly name for the mailer
            $table->enum('provider', [
                'smtp',
                'mailgun',
                'ses',
                'postmark',
                'resend',
                'sendmail',
                'log'
            ]);
            $table->boolean('is_active')->default(false); // Only one active mailer per user
            $table->text('credentials'); // Encrypted JSON containing provider-specific credentials
            $table->string('from_address')->nullable(); // Override default from address
            $table->string('from_name')->nullable(); // Override default from name
            $table->boolean('test_status')->default(false); // Whether test email was successful
            $table->text('test_error')->nullable(); // Error message from test if failed
            $table->timestamp('last_tested_at')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index(['user_id', 'is_active']);
            $table->index('provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mailers');
    }
};
