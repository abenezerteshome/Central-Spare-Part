<?php

namespace App\Http\Controllers\Brands;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class BrandController extends Controller
{
    use ApiResponse;

    /**
     * List all brands
     */
    public function index(Request $request)
    {
        $brands = Brand::orderBy('name')->paginate($request->get('per_page', 20));
        return $this->success($brands);
    }

    /**
     * Store a new brand
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
            'description' => 'nullable|string|max:1000',
        ]);

        $brand = Brand::create($data);

        return $this->success($brand, 'Brand created', 201);
    }

    /**
     * Show a specific brand
     */
    public function show($id)
    {
        $brand = Brand::findOrFail($id);
        return $this->success($brand);
    }

    /**
     * Update a brand
     */
    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255|unique:brands,name,' . $id,
            'description' => 'nullable|string|max:1000',
        ]);

        $brand->update($data);

        return $this->success($brand, 'Brand updated');
    }

    /**
     * Delete a brand
     */
    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        $brand->delete();

        return $this->success(null, 'Brand deleted', 204);
    }
}
