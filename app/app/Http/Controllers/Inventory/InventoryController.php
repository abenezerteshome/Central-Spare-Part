<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\PartItem;
use App\Models\Store;
use App\Services\InventoryService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    use ApiResponse;

    protected $inventory;

    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    /**
     * Increase stock for a PartItem
     */
    public function increase(Request $request)
    {
        $data = $request->validate([
            'part_item_id' => 'required|exists:part_items,id',
            'qty' => 'required|integer|min:1',
            'note' => 'nullable|string',
        ]);

        $item = PartItem::findOrFail($data['part_item_id']);

        $this->inventory->increaseStock(
            $item,
            $data['qty'],
            auth()->id(),
            $data['note'] ?? 'Restock'
        );

        return $this->success($item->fresh(), 'Stock increased');
    }

    /**
     * Decrease stock (used for manual adjustments)
     */
    public function decrease(Request $request)
    {
        $data = $request->validate([
            'part_item_id' => 'required|exists:part_items,id',
            'qty' => 'required|integer|min:1',
            'note' => 'nullable|string',
        ]);

        $item = PartItem::findOrFail($data['part_item_id']);

        $this->inventory->decreaseStock(
            $item,
            $data['qty'],
            auth()->id(),
            $data['note'] ?? 'Manual adjustment'
        );

        return $this->success($item->fresh(), 'Stock decreased');
    }

    /**
     * List stock for all PartItems grouped by store
     */
    public function stocks(Request $request)
    {
        $query = PartItem::with(['part.brand', 'part.category', 'part.images', 'store', 'agent'])
            ->latest();

        if ($request->filled('search')) {
            $search = trim($request->get('search'));
            $query->whereHas('part', function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('sku', 'ILIKE', "%{$search}%")
                    ->orWhere('part_number', 'ILIKE', "%{$search}%");
            });
        }

        if ($request->filled('store_id')) {
            $query->where('store_id', $request->get('store_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $stocks = $query->paginate($request->get('per_page', 100));

        return $this->success($stocks);
    }

    /**
     * Show stock for a specific part
     */
    public function stockByPart($partId)
    {
        $items = PartItem::with('store')
            ->where('part_id', $partId)
            ->get();

        return $this->success($items);
    }
}
