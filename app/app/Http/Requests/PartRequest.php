<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PartRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     *
     * If the client sent `part_item` (or `technical_specs`) as a JSON string via FormData,
     * decode it to an array so the validation rules that expect arrays pass.
     */
    protected function prepareForValidation()
    {
        // decode part_item if it's a JSON string
        if ($this->has('part_item') && is_string($this->input('part_item'))) {
            $decoded = json_decode($this->input('part_item'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['part_item' => $decoded]);
            }
        }

        // decode technical_specs if sent as JSON string
        if ($this->has('technical_specs') && is_string($this->input('technical_specs'))) {
            $decoded = json_decode($this->input('technical_specs'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['technical_specs' => $decoded]);
            }
        }

        // normalize is_active values (FormData often sends "true"/"false" strings)
        if ($this->has('is_active')) {
            $val = $this->input('is_active');
            if (is_string($val)) {
                $lower = strtolower($val);
                if ($lower === 'true' || $lower === '1' || $lower === 'on') {
                    $this->merge(['is_active' => true]);
                } else {
                    $this->merge(['is_active' => false]);
                }
            }
        }
    }

    public function rules()
    {
        return [
            'sku' => [
                'nullable',
                'string',
                'max:255',
                // ignore current part id when updating so unique rule doesn't fail
                Rule::unique('parts', 'sku')->ignore($this->route('id')),
            ],
            'part_number' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'unit_cost' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'shelf' => 'nullable|string|max:255',
            'agent_id' => 'nullable|uuid|exists:agents,id',
            'brand_id' => 'nullable|uuid|exists:brands,id',
            'category_id' => 'nullable|integer|exists:categories,id',
            'description' => 'nullable|string',
            'technical_specs' => 'nullable|array', // handle JSON field
            'technical_specs.*' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'part_item' => 'nullable|array',
            'part_item.shelf' => 'nullable|string|max:255',
            'part_item.store_id' => 'nullable|uuid|exists:stores,id',
            'part_item.agent_id' => 'nullable|uuid|exists:agents,id',
            'part_item.quantity' => 'nullable|integer|min:1',
            'part_item.unit_cost' => 'nullable|numeric|min:0',
            'part_item.unit_price' => 'nullable|numeric|min:0',
            'part_item.serial_number' => 'nullable|string|max:255',
            'part_item.condition' => 'nullable|string|in:new,used,refurb',
            'part_item.status' => 'nullable|string',
            'part_item.image_ids' => 'nullable|array',
            'part_item.image_ids.*' => 'nullable|uuid',
        ];
    }
}
