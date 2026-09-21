<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['system' => 'Engine', 'subsystem' => 'Fuel System'],
            ['system' => 'Hydraulics', 'subsystem' => 'Pumps'],
            ['system' => 'Electrical', 'subsystem' => 'Sensors'],
            ['system' => 'Transmission', 'subsystem' => 'Gearbox'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate($cat);
        }
    }
}

