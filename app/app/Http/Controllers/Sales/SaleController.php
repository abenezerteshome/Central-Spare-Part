<?php

   namespace App\Http\Controllers\Sales;
   
   
   use App\Http\Controllers\Controller;
   use App\Services\SalesService;
   use App\Http\Requests\SaleRequest;
   use App\Traits\ApiResponse;
   
   
   class SaleController extends Controller
   {
   use ApiResponse;
   
   
   protected $sales;
   
   
   public function __construct(SalesService $sales)
   {
      $this->sales = $sales;
   }
   
   
   public function store(SaleRequest $request)
   {
      $payload = $request->validated();
      $sale = $this->sales->createSale($payload, auth()->id());
      return $this->success(new \App\Http\Resources\SaleResource($sale), 'Sale recorded', 201);
   }
   
   
   public function index()
   {
      $q = \App\Models\Sale::with('items.partItem.store', 'items.partItem.part.images', 'items.part')->latest()->paginate(20);
      // transform collection items to SaleResource while keeping paginator meta
      $collection = $q->getCollection()->map(function ($sale) {
         return new \App\Http\Resources\SaleResource($sale);
      });
      $q->setCollection($collection);
      return $this->success($q);
   }
   
   
   public function show($id)
   {
      $sale = \App\Models\Sale::with('items.partItem.store', 'items.partItem.part.images', 'items.part')->findOrFail($id);
      return $this->success(new \App\Http\Resources\SaleResource($sale));
   }


   public function updateStatus($id)
   {
      $data = request()->validate(['status' => 'required|string|in:pending,buyed,rejected']);
      $sale = $this->sales->changeStatus($id, $data['status'], auth()->id());
      return $this->success(new \App\Http\Resources\SaleResource($sale), 'Status updated');
   }

   /**
    * Delete a sale and its items
    */
   public function destroy($id)
   {
      $sale = \App\Models\Sale::findOrFail($id);
      $sale->items()->delete();
      $sale->delete();
      return $this->success(null, 'Sale deleted');
   }
}
