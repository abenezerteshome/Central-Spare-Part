<?php

namespace App\Services;

use App\Models\PartItem;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;

class SalesService
{
    protected $inventory;

    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    public function createSale(array $payload, $actorId = null)
    {
        return DB::transaction(function () use ($payload, $actorId) {
            $statusMap = [
                'pending' => 'draft',
                'buyed' => 'confirmed',
                'rejected' => 'returned',
            ];
            $dbStatus = $statusMap[$payload['status'] ?? null] ?? 'draft';

            $sale = Sale::create([
                'buyer_name' => $payload['buyer_name'] ?? 'Walk-in Customer',
                'buyer_phone' => $payload['buyer_phone'] ?? null,
                'buyer_location' => $payload['buyer_location'] ?? ($payload['buyer_address'] ?? null),
                'product_detail' => $payload['product_detail'] ?? null,
                'created_by' => $actorId,
                'total' => 0,
                'status' => $dbStatus,
            ]);

            $total = 0;

            if (!empty($payload['items']) && is_array($payload['items'])) {
                foreach ($payload['items'] as $itemData) {
                    $partItem = PartItem::with('part')->findOrFail($itemData['part_item_id']);
                    $qty = (int) $itemData['qty'];
                    $unitPrice = $itemData['unit_price'] ?? $partItem->unit_price ?? $partItem->part?->unit_price ?? 0;
                    $unitCost = $partItem->unit_cost ?? 0;
                    $subtotal = $unitPrice * $qty;

                    $this->inventory->decreaseStock(
                        $partItem,
                        $qty,
                        $actorId,
                        'Sold in Sale #' . $sale->order_number,
                        $sale->id
                    );

                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'part_item_id' => $partItem->id,
                        'part_id' => $partItem->part_id,
                        'qty' => $qty,
                        'unit_price' => $unitPrice,
                        'unit_cost' => $unitCost,
                        'subtotal' => $subtotal,
                    ]);

                    $total += $subtotal;
                }
            }

            $sale->total = $total;
            $sale->save();

            return $sale->load('items.partItem.store', 'items.partItem.part.images', 'items.part');
        });
    }

    public function changeStatus($saleId, $status, $actorId = null)
    {
        $sale = Sale::findOrFail($saleId);

        $map = [
            'pending' => 'draft',
            'buyed' => 'confirmed',
            'rejected' => 'returned',
        ];

        $sale->status = $map[$status] ?? $status;
        $sale->save();

        return $sale->load('items.partItem.store', 'items.partItem.part.images', 'items.part');
    }
}
