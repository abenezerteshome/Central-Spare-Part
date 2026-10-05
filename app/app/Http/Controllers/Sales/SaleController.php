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

      \App\Services\ActivityLogger::log('Create', 'Sales', "Sale recorded for buyer: {$sale->buyer_name} (Total: {$sale->total_price} Birr)", 'sales', $sale->id, [
         'buyer_name' => $sale->buyer_name,
         'buyer_phone' => $sale->buyer_phone,
         'total_price' => $sale->total_price,
         'status' => $sale->status,
         'items_count' => count($request->input('items', [])),
      ]);

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

      \App\Services\ActivityLogger::log('Update', 'Sales', "Updated sale #{$id} status to '{$data['status']}'", 'sales', $id, [
         'status' => $data['status'],
         'buyer_name' => $sale->buyer_name,
      ]);

      return $this->success(new \App\Http\Resources\SaleResource($sale), 'Status updated');
   }

   /**
    * Delete a sale and its items
    */
   public function destroy($id)
   {
      $sale = \App\Models\Sale::findOrFail($id);
      $buyer = $sale->buyer_name;
      $total = $sale->total_price;
      $sale->items()->delete();
      $sale->delete();

      \App\Services\ActivityLogger::log('Delete', 'Sales', "Deleted sale #{$id} for buyer {$buyer} ({$total} Birr)", 'sales', $id);

      return $this->success(null, 'Sale deleted');
   }
}
