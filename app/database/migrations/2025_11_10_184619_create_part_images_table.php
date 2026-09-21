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
        Schema::create('part_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('part_id')->nullable();
            $table->uuid('part_item_id')->nullable();
            $table->uuid('uploader_id')->nullable();
            $table->string('file_path');
            $table->string('thumb_path')->nullable();
            $table->string('phash')->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->timestamps();

            $table->foreign('part_id')->references('id')->on('parts')->onDelete('cascade');
            $table->foreign('part_item_id')->references('id')->on('part_items')->onDelete('cascade');
            $table->foreign('uploader_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_images');
    }
};
