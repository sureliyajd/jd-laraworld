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
        Schema::create('task_assignments', function (Blueprint $table) {
            $table->id();
            $table->enum('role', ['assignee', 'collaborator', 'watcher'])->default('assignee');
            $table->dateTime('assigned_at');
            $table->dateTime('unassigned_at')->nullable();
            $table->text('notes')->nullable(); // Assignment notes
            
            // Foreign keys
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
            
            // Unique constraint to prevent duplicate assignments
            $table->unique(['task_id', 'user_id', 'role']);
            
            // Indexes
            $table->index(['task_id', 'role']);
            $table->index(['user_id', 'role']);
            $table->index(['assigned_by', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_assignments');
    }
};
