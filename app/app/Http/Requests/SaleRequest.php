<?php

namespace App\Http\Requests;


use Illuminate\Foundation\Http\FormRequest;


class SaleRequest extends FormRequest
{
public function authorize() { return true; }
public function rules()
{
return [
	'buyer_name' => 'nullable|string|max:255',
	'buyer_phone' => 'nullable|string|max:50',
	'buyer_location' => 'nullable|string',
	'buyer_address' => 'nullable|string',
	'product_detail' => 'nullable|string',
	'status' => 'nullable|string|in:pending,buyed,rejected',
	'items' => 'nullable|array|min:1',
	'items.*.part_item_id' => 'required_with:items|uuid|exists:part_items,id',
	'items.*.qty' => 'required_with:items|integer|min:1',
	'items.*.unit_price' => 'nullable|numeric|min:0',
];
}
}
