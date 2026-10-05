<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('actor_id')->nullable();
                $table->string('action');
                $table->string('module')->nullable();
                $table->string('target_table')->nullable();
                $table->string('target_id')->nullable();
                $table->text('description')->nullable();
                $table->json('before')->nullable();
                $table->json('after')->nullable();
                $table->json('details')->nullable();
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamps();

                $table->foreign('actor_id')->references('id')->on('users')->onDelete('set null');
            });
        } else {
            Schema::table('audit_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('audit_logs', 'module')) {
                    $table->string('module')->nullable()->after('action');
                }
                if (!Schema::hasColumn('audit_logs', 'description')) {
                    $table->text('description')->nullable()->after('target_table');
                }
                if (!Schema::hasColumn('audit_logs', 'details')) {
                    $table->json('details')->nullable()->after('after');
                }
                if (!Schema::hasColumn('audit_logs', 'ip_address')) {
                    $table->string('ip_address')->nullable()->after('details');
                }
                if (!Schema::hasColumn('audit_logs', 'user_agent')) {
                    $table->text('user_agent')->nullable()->after('ip_address');
                }
            });

            try {
                // Ensure target_id is varchar(255) to support string/integer target IDs
                DB::statement('ALTER TABLE audit_logs MODIFY COLUMN target_id VARCHAR(255) NULL');
            } catch (\Throwable $e) {}
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Preserve audit logs on rollback
    }
};
