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
        if (!Schema::hasTable('shelves')) {
            Schema::create('shelves', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name')->unique();
                $table->string('description')->nullable();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('parts') && !Schema::hasColumn('parts', 'shelf')) {
            Schema::table('parts', function (Blueprint $table) {
                $table->string('shelf')->nullable()->after('description');
            });
        }

        if (Schema::hasTable('part_items') && !Schema::hasColumn('part_items', 'shelf')) {
            Schema::table('part_items', function (Blueprint $table) {
                $table->string('shelf')->nullable()->after('store_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('part_items') && Schema::hasColumn('part_items', 'shelf')) {
            Schema::table('part_items', function (Blueprint $table) {
                $table->dropColumn('shelf');
            });
        }

        if (Schema::hasTable('parts') && Schema::hasColumn('parts', 'shelf')) {
            Schema::table('parts', function (Blueprint $table) {
                $table->dropColumn('shelf');
            });
        }

        Schema::dropIfExists('shelves');
    }
};
