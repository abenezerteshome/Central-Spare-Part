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
        Schema::create('sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique();
            $table->string('buyer_name');
            $table->string('buyer_phone')->nullable();
            $table->text('buyer_location')->nullable();
            $table->text('product_detail')->nullable();
            $table->uuid('created_by')->nullable();
            $table->decimal('total', 15, 2)->default(0);
            $table->decimal('tax', 15,2)->default(0);
            $table->decimal('discount', 15,2)->default(0);
            $table->enum('status', ['draft','confirmed','shipped','completed','returned'])->default('draft');
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('sale_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sale_id');
            $table->uuid('part_item_id');
            $table->uuid('part_id');
            $table->integer('qty')->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('unit_cost', 15, 2)->nullable();
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();

            $table->foreign('sale_id')->references('id')->on('sales')->onDelete('cascade');
            $table->foreign('part_item_id')->references('id')->on('part_items')->onDelete('set null');
            $table->foreign('part_id')->references('id')->on('parts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
    }
};
