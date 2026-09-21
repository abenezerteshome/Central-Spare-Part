<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agent;


class AgentSeeder extends Seeder
{
    public function run(): void
    {
        $agents = [
            [
                'name' => 'Abebe Machinery Parts',
                'phone' => '+251900000001',
                'address' => 'Addis Ababa, Merkato',
            ],
            [
                'name' => 'Mulu Spare Store',
                'phone' => '+251900000002',
                'address' => 'Adama, Main Street',
            ],
        ];

        foreach ($agents as $agent) {
            Agent::firstOrCreate($agent);
        }
    }
}
