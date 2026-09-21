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
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('part_item_id')->nullable();
            $table->uuid('part_id')->nullable();
            $table->integer('change');
            $table->string('type'); // inbound, sale, transfer, adjustment, qc_reject
            $table->uuid('ref_id')->nullable(); // sale_id / po_id
            $table->uuid('actor_id')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('part_item_id')->references('id')->on('part_items')->onDelete('set null');
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
