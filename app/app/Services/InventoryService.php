<?php

namespace App\Services;

use App\Models\InventoryTransaction;
use App\Models\PartItem;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function increaseStock(PartItem $item, int $qty, $actorId = null, $note = null)
    {
        return DB::transaction(function() use ($item, $qty, $actorId, $note) {
            $item = PartItem::whereKey($item->id)->lockForUpdate()->firstOrFail();
            $item->quantity += $qty;
            if ($item->quantity > 0 && $item->status === 'sold') {
                $item->status = 'available';
            }
            $item->save();

            $this->syncAggregateStock($item);

            InventoryTransaction::create([
                'part_item_id' => $item->id,
                'part_id' => $item->part_id,
                'change' => $qty,
                'type' => 'inbound',
                'actor_id' => $actorId,
                'note' => $note
            ]);

            return $item->fresh();
        });
    }

    public function decreaseStock(PartItem $item, int $qty, $actorId = null, $note = null, $refId = null)
    {
        return DB::transaction(function() use ($item, $qty, $actorId, $note, $refId) {
            $item = PartItem::whereKey($item->id)->lockForUpdate()->firstOrFail();

            if ($qty < 1) {
                throw ValidationException::withMessages(['qty' => 'Quantity must be at least 1.']);
            }

            if ($item->quantity < $qty) {
                throw ValidationException::withMessages([
                    'qty' => "Insufficient stock. Available quantity is {$item->quantity}.",
                ]);
            }

            $item->quantity -= $qty;
            if ($item->quantity === 0) {
                $item->status = 'sold';
            }
            $item->save();

            $this->syncAggregateStock($item);

            InventoryTransaction::create([
                'part_item_id' => $item->id,
                'part_id' => $item->part_id,
                'change' => -$qty,
                'type' => 'sale',
                'ref_id' => $refId,
                'actor_id' => $actorId,
                'note' => $note
            ]);

            return $item->fresh();
        });
    }

    public function recordInitialStock(PartItem $item, $actorId = null, $note = 'Initial upload stock')
    {
        $qty = max(0, (int) $item->quantity);
        if ($qty === 0) {
            return $item;
        }

        return DB::transaction(function() use ($item, $qty, $actorId, $note) {
            $item = PartItem::whereKey($item->id)->lockForUpdate()->firstOrFail();
            $this->syncAggregateStock($item);

            InventoryTransaction::create([
                'part_item_id' => $item->id,
                'part_id' => $item->part_id,
                'change' => $qty,
                'type' => 'inbound',
                'actor_id' => $actorId,
                'note' => $note,
            ]);

            return $item->fresh();
        });
    }

    private function syncAggregateStock(PartItem $item): Stock
    {
        $stock = Stock::firstOrCreate(
            ['part_id' => $item->part_id, 'store_id' => $item->store_id],
            ['quantity' => 0]
        );

        $stock = Stock::whereKey($stock->id)->lockForUpdate()->first();
        $stock->quantity = max(0, (int) PartItem::where('part_id', $item->part_id)
            ->where('store_id', $item->store_id)
            ->sum('quantity'));
        $stock->save();

        return $stock;
    }
}
