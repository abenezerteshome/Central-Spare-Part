<?php

namespace App\Http\Controllers\Search;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\Part;
use App\Models\Brand;
use App\Models\Store;
use App\Models\Agent;

class SearchController extends Controller
{
    use ApiResponse;

    public function globalSearch(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (!$query) {
            return $this->error('Search query (q) is required', 400);
        }

        // search parts
        $parts = Part::where('name', 'ILIKE', "%{$query}%")
            ->orWhere('part_number', 'ILIKE', "%{$query}%")
            ->limit(10)
            ->with('brand', 'category')
            ->get(['id', 'name', 'part_number', 'brand_id', 'category_id']);

        // search brands
        $brands = Brand::where('name', 'ILIKE', "%{$query}%")
            ->limit(10)
            ->get(['id', 'name']);

        // search stores
        $stores = Store::where('name', 'ILIKE', "%{$query}%")
            ->orWhere('address', 'ILIKE', "%{$query}%")
            ->limit(10)
            ->get(['id', 'name', 'address']);

        // search agents
        $agents = Agent::where('name', 'ILIKE', "%{$query}%")
            ->orWhere('phone', 'ILIKE', "%{$query}%")
            ->limit(10)
            ->get(['id', 'name', 'phone', 'address']);

        return $this->success([
            'parts' => $parts,
            'brands' => $brands,
            'stores' => $stores,
            'agents' => $agents,
        ]);
    }
}
