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
        Schema::table('email_logs', function (Blueprint $table) {
            $table->foreignId('mailer_id')->nullable()->after('sent_by')->constrained('mailers')->onDelete('set null');
            $table->index('mailer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_logs', function (Blueprint $table) {
            $table->dropForeign(['mailer_id']);
            $table->dropIndex(['mailer_id']);
            $table->dropColumn('mailer_id');
        });
    }
};
