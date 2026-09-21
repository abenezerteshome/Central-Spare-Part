<?php

namespace App\Http\Controllers;

use App\Models\Shelf;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShelfController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $shelves = Shelf::orderBy('name')->get();
        return $this->success($shelves);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:shelves,name',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $shelf = Shelf::create([
            'name' => trim($request->input('name')),
            'description' => $request->input('description'),
        ]);

        return $this->success($shelf, 'Shelf created successfully', 201);
    }
}
