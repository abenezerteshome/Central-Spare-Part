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
        Schema::table('parts', function (Blueprint $table) {
            if (!Schema::hasColumn('parts', 'unit_cost')) {
                // store monetary values with 2 decimal places
                $table->decimal('unit_cost', 12, 2)->nullable()->after('description');
            }
            if (!Schema::hasColumn('parts', 'unit_price')) {
                $table->decimal('unit_price', 12, 2)->nullable()->after('unit_cost');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parts', function (Blueprint $table) {
            if (Schema::hasColumn('parts', 'unit_price')) {
                $table->dropColumn('unit_price');
            }
            if (Schema::hasColumn('parts', 'unit_cost')) {
                $table->dropColumn('unit_cost');
            }
        });
    }
};
