<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class CategoryController extends Controller
{
    use ApiResponse;

    /**
     * List all categories
     */
    public function index(Request $request)
    {
        $categories = Category::orderBy('system')
            ->paginate($request->get('per_page', 20));

        return $this->success($categories);
    }

    /**
     * Store a new category
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'system' => 'required|string|max:255|unique:categories,system',
            'subsystem' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'notes' => 'nullable|string',
        ]);

        $category = Category::create($data);

        return $this->success($category, 'Category created', 201);
    }

    /**
     * Show a specific category
     */
    public function show($id)
    {
        $category = Category::findOrFail($id);
        return $this->success($category);
    }

    /**
     * Update a category
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'system' => 'sometimes|string|max:255|unique:categories,system,' . $id,
            'subsystem' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $id,
            'notes' => 'nullable|string',
        ]);

        $category->update($data);

        return $this->success($category, 'Category updated');
    }

    /**
     * Delete a category
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return $this->success(null, 'Category deleted', 204);
    }
}
