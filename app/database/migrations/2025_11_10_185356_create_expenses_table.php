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
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('ETB');
            $table->string('category')->nullable();
            $table->uuid('paid_by')->nullable();
            $table->date('date');
            $table->uuid('receipt_image_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('paid_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
