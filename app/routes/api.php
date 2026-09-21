<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Users\UserController;
use App\Http\Controllers\Parts\PartController;
use App\Http\Controllers\Category\CategoryController;
use App\Http\Controllers\Agents\AgentController;
use App\Http\Controllers\Brands\BrandController;
use App\Http\Controllers\Sales\SaleController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Expenses\ExpenseController;
use App\Http\Controllers\Reports\ReportController;


use App\Http\Controllers\Search\SearchController;
use App\Http\Controllers\ShelfController;

Route::middleware(['auth:sanctum'])->get('/search', [SearchController::class, 'globalSearch']);

// Shelves / Locations
Route::prefix('shelves')->group(function () {
    Route::get('/', [ShelfController::class, 'index']);
    Route::post('/', [ShelfController::class, 'store']);
});

// --------------------------
// Admin Auth
// --------------------------
Route::post('/admin/login', [UserController::class, 'adminLogin']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/admin/me', [UserController::class, 'adminMe']);
    Route::post('/admin/logout', [UserController::class, 'adminLogout']);
});

// --------------------------
// User Routes
// --------------------------
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/user/upload-profile', [UserController::class, 'uploadProfilePhoto']);
    Route::get('/me', [UserController::class, 'me']);
    Route::post('/logout', [UserController::class, 'logout']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::put('/users/{id}/block', [UserController::class, 'blockUser']);
    Route::put('/users/{id}/unblock', [UserController::class, 'unblockUser']);
    Route::put('/users/{id}/role', [UserController::class, 'changeRole']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

// --------------------------
// Part Routes
// --------------------------
Route::prefix('parts')->group(function () {
    Route::get('/', [PartController::class, 'index']);
    Route::get('/{id}', [PartController::class, 'show']);
    Route::middleware(['auth:sanctum'])->post('/', [PartController::class, 'store']);
    Route::middleware(['auth:sanctum', 'admin'])->put('/{id}', [PartController::class, 'update']);
    Route::middleware(['auth:sanctum', 'admin'])->delete('/{id}', [PartController::class, 'destroy']);
});

// Categories
Route::middleware(['auth:sanctum'])->prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{id}', [CategoryController::class, 'show']);
    Route::middleware('admin')->post('/', [CategoryController::class, 'store']);
    Route::middleware('admin')->put('/{id}', [CategoryController::class, 'update']);
    Route::middleware('admin')->delete('/{id}', [CategoryController::class, 'destroy']);
});

// Agents
Route::middleware(['auth:sanctum'])->prefix('agents')->group(function () {
    Route::get('/', [AgentController::class, 'index']);
    Route::get('/{id}', [AgentController::class, 'show']);
    Route::middleware('admin')->post('/', [AgentController::class, 'store']);
    Route::middleware('admin')->put('/{id}', [AgentController::class, 'update']);
    Route::middleware('admin')->delete('/{id}', [AgentController::class, 'destroy']);
});

// Brands
Route::middleware(['auth:sanctum'])->prefix('brands')->group(function () {
    Route::get('/', [BrandController::class, 'index']);
    Route::get('/{id}', [BrandController::class, 'show']);
    Route::middleware('admin')->post('/', [BrandController::class, 'store']);
    Route::middleware('admin')->put('/{id}', [BrandController::class, 'update']);
    Route::middleware('admin')->delete('/{id}', [BrandController::class, 'destroy']);
});

// --------------------------
// Sales Routes
// --------------------------
Route::middleware(['auth:sanctum'])->prefix('sales')->group(function () {
    Route::get('/', [SaleController::class, 'index']);
    Route::get('/{id}', [SaleController::class, 'show']);
    Route::post('/', [SaleController::class, 'store']);
    Route::middleware('admin')->put('/{id}/status', [SaleController::class, 'updateStatus']);
    Route::middleware('admin')->delete('/{id}', [SaleController::class, 'destroy']);
});

// --------------------------
// Inventory Routes
// --------------------------
Route::middleware(['auth:sanctum'])->prefix('inventory')->group(function () {
    Route::middleware('admin')->post('increase', [InventoryController::class, 'increase']);
    Route::middleware('admin')->post('decrease', [InventoryController::class, 'decrease']); // optional manual adjustment
    Route::get('stocks', [InventoryController::class, 'stocks']);
    Route::get('part/{partId}', [InventoryController::class, 'stockByPart']);
});

// --------------------------
// Expenses Routes 
// --------------------------
Route::middleware(['auth:sanctum'])->prefix('expenses')->group(function () {
    Route::get('/', [ExpenseController::class, 'index']);
    Route::get('/{id}', [ExpenseController::class, 'show']);
    Route::middleware('admin')->post('/', [ExpenseController::class, 'store']);
    Route::middleware('admin')->put('/{id}', [ExpenseController::class, 'update']);
    Route::middleware('admin')->delete('/{id}', [ExpenseController::class, 'destroy']);
});

// --------------------------
// Reports Routes 
// --------------------------

Route::middleware(['auth:sanctum'])->prefix('reports')->group(function () {
    Route::get('/summary', [ReportController::class, 'summary']);
    Route::get('/daily-sales', [ReportController::class, 'dailySales']);
    Route::get('/monthly-profit', [ReportController::class, 'monthlyProfit']);
});

// Spare Part Shops
use App\Http\Controllers\Api\SparePartShopController;

Route::middleware(['auth:sanctum'])->prefix('spare-part-shops')->group(function () {
    Route::get('/', [SparePartShopController::class, 'index']);
    Route::get('/{id}', [SparePartShopController::class, 'show']);
    Route::middleware('admin')->post('/', [SparePartShopController::class, 'store']);
    Route::middleware('admin')->put('/{id}', [SparePartShopController::class, 'update']);
    Route::middleware('admin')->delete('/{id}', [SparePartShopController::class, 'destroy']);
});

