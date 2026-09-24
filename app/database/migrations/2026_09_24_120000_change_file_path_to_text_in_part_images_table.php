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
            $table->text('file_path')->change();
            $table->text('thumb_path')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_images', function (Blueprint $table) {
            $table->string('file_path', 255)->change();
            $table->string('thumb_path', 255)->nullable()->change();
        });
    }
};
