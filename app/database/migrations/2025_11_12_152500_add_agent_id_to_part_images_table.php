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
        Schema::table('part_images', function (Blueprint $table) {
            if (!Schema::hasColumn('part_images', 'agent_id')) {
                $table->uuid('agent_id')->nullable()->after('part_item_id');
                $table->foreign('agent_id')->references('id')->on('agents')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_images', function (Blueprint $table) {
            if (Schema::hasColumn('part_images', 'agent_id')) {
                $table->dropForeign(['agent_id']);
                $table->dropColumn('agent_id');
            }
        });
    }
};
