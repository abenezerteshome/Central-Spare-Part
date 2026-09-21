<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Hitachi'],
            ['name' => 'CAT'],
            ['name' => 'Komatsu'],
            ['name' => 'Doosan'],
            ['name' => 'Develon'],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate($brand);
        }
    }
}

