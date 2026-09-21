<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SparePartShop;
use App\Http\Resources\SparePartShopResource;

class SparePartShopController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);
        $shops = SparePartShop::orderBy('id', 'desc')->paginate($perPage);
        return SparePartShopResource::collection($shops);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        $shop = SparePartShop::create($data);

        return (new SparePartShopResource($shop))->response()->setStatusCode(201);
    }

    public function show($id)
    {
        $shop = SparePartShop::findOrFail($id);
        return new SparePartShopResource($shop);
    }

    public function update(Request $request, $id)
    {
        $shop = SparePartShop::findOrFail($id);

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        $shop->update($data);

        return new SparePartShopResource($shop);
    }

    public function destroy($id)
    {
        $shop = SparePartShop::findOrFail($id);
        $shop->delete();
        return response()->noContent();
    }
}
