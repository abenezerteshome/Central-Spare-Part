<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('part_items', function (Blueprint $table) {
            if (!Schema::hasColumn('part_items', 'condition')) {
                $table->string('condition')->default('new')->after('serial_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('part_items', function (Blueprint $table) {
            if (Schema::hasColumn('part_items', 'condition')) {
                $table->dropColumn('condition');
            }
        });
    }
};
