<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'buyer_name' => $this->buyer_name,
            'buyer_phone' => $this->buyer_phone,
            'buyer_location' => $this->buyer_location,
            'product_detail' => $this->product_detail,
            'total' => $this->total,
            'tax' => $this->tax,
            'discount' => $this->discount,
            // `status` accessor on model already normalizes values
            'status' => $this->status,
            // human friendly date (ISO)
            'date' => $this->date ?? optional($this->created_at)->toDateTimeString(),
            'created_at' => optional($this->created_at)->toDateTimeString(),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($it) {
                    return [
                        'id' => $it->id,
                        'part_item_id' => $it->part_item_id,
                        'part' => $it->part ?? null,
                        'partItem' => $it->partItem ?? null,
                        'store' => $it->partItem?->store ?? null,
                        'qty' => $it->qty,
                        'unit_price' => $it->unit_price,
                        'unit_cost' => $it->unit_cost,
                        'subtotal' => $it->subtotal,
                    ];
                });
            }),
        ];
    }
}
