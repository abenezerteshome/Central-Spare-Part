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
        Schema::create('part_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('part_id');
            $table->uuid('store_id');
            $table->uuid('agent_id')->nullable();
            $table->string('batch_no')->nullable();
            $table->string('serial_number')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_cost', 15, 2)->nullable();
            $table->decimal('unit_price', 15, 2)->nullable();
            $table->enum('condition', ['new','used','refurb'])->default('new');
            $table->enum('status', ['available','reserved','sold','quarantine'])->default('available');
            $table->json('image_ids')->nullable();
            $table->timestamps();

            $table->foreign('part_id')->references('id')->on('parts')->onDelete('cascade');
            $table->foreign('store_id')->references('id')->on('stores')->onDelete('cascade');
            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_items');
    }
};
