<?php

namespace App\Http\Controllers\Parts;

use App\Http\Controllers\Controller;
use App\Models\Part;
use App\Models\PartItem;
use App\Models\Store;
use App\Http\Requests\PartRequest;
use App\Traits\ApiResponse;
use App\Models\User;
use App\Services\InventoryService;
use App\Traits\HandlesImages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PartController extends Controller
{
    use ApiResponse, HandlesImages;

    public function index(Request $request)
    {
        $query = Part::with(['brand', 'category', 'images', 'agent', 'items.agent', 'items.store']);

        if ($request->filled('agent_id')) {
            $agentId = $request->input('agent_id');
            $query->where(function ($q) use ($agentId) {
                $q->where('agent_id', $agentId)
                  ->orWhereHas('items', function ($itemQuery) use ($agentId) {
                      $itemQuery->where('agent_id', $agentId);
                  });
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->input('brand_id'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $parts = $query->paginate(200000);
        return $this->success($parts);
    }

    public function show($id)
    {
        $part = Part::with(['brand', 'category', 'items.store', 'images', 'agent'])->findOrFail($id);
        return $this->success($part);
    }

    public function store(PartRequest $request)
    {
        $data = $request->validated();

        // Prepare part_item if present (clients may send it as JSON string in FormData)
        $itemDataRaw = $request->input('part_item');
        $itemData = [];
        if ($itemDataRaw) {
            $itemData = is_string($itemDataRaw) ? (json_decode($itemDataRaw, true) ?: []) : $itemDataRaw;
        }

        $partData = [
            'sku' => $data['sku'] ?? null,
            'part_number' => $data['part_number'] ?? null,
            'name' => $data['name'],
            'brand_id' => $data['brand_id'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'description' => $data['description'] ?? null,
            'shelf' => $data['shelf'] ?? ($itemData['shelf'] ?? null),
            'condition' => $data['part_item']['condition'] ?? ($itemData['condition'] ?? 'new'),
            'unit_cost' => $data['unit_cost'] ?? null,
            'unit_price' => $data['unit_price'] ?? null,
            'technical_specs' => isset($data['technical_specs'])
                ? json_encode($data['technical_specs'])
                : null,
            'agent_id' => $data['agent_id'] ?? ($itemData['agent_id'] ?? null),
        ];

        if (array_key_exists('is_active', $data)) {
            $partData['is_active'] = DB::raw($request->boolean('is_active') ? 'true' : 'false');
        }

        // create the part
        $part = Part::create($partData);

        // if agent_id wasn't provided in top-level payload, but part_item contains it, persist it on the part
        if (empty($part->agent_id) && !empty($itemData['agent_id'])) {
            $part->agent_id = $itemData['agent_id'];
            $part->save();
        }

        // handle image upload (single 'image' or multiple 'images[]')
        if ($request->hasFile('images')) {
            $files = $request->file('images');
            $imagesMeta = $request->input('images_meta', []);
            $imagesInput = $request->input('images', []);
            $imagesUploaderIds = $request->input('images_uploader_ids', []);
            $topUploader = $request->input('uploader_id', null);

            if (is_array($files)) {
                foreach ($files as $idx => $file) {
                    $res = $this->storeImage($file);

                    // reset per-image variables to avoid carry-over between iterations
                    $uploaderId = null;
                    $agentIdForImage = null;

                    // determine uploader id: prefer per-image meta, then indexed arrays, then top-level, then part_item.agent_id, else auth
                    if (isset($imagesMeta[$idx]) && is_array($imagesMeta[$idx])) {
                        if (!empty($imagesMeta[$idx]['uploader_id'])) {
                            $uploaderId = $imagesMeta[$idx]['uploader_id'];
                        }
                        if (!empty($imagesMeta[$idx]['agent_id'])) {
                            $agentIdForImage = $imagesMeta[$idx]['agent_id'];
                        }
                    } elseif (isset($imagesInput[$idx]) && is_array($imagesInput[$idx]) && !empty($imagesInput[$idx]['uploader_id'])) {
                        $uploaderId = $imagesInput[$idx]['uploader_id'];
                    } elseif (isset($imagesInput[$idx]) && is_array($imagesInput[$idx]) && !empty($imagesInput[$idx]['agent_id'])) {
                        $agentIdForImage = $imagesInput[$idx]['agent_id'];
                    } elseif (isset($imagesUploaderIds[$idx]) && !empty($imagesUploaderIds[$idx])) {
                        $uploaderId = $imagesUploaderIds[$idx];
                    } elseif (!empty($topUploader)) {
                        $uploaderId = $topUploader;
                    } elseif (!empty($itemData['agent_id'])) {
                        $agentIdForImage = $itemData['agent_id'];
                    }
                    
                    // if uploaderId was provided but does not exist in users table, ignore it and fall back to authenticated user
                    if ($uploaderId && !User::where('id', $uploaderId)->exists()) {
                        $uploaderId = null;
                    }

                    // validate agent id exists
                    if (!empty($agentIdForImage) && !\App\Models\Agent::where('id', $agentIdForImage)->exists()) {
                        $agentIdForImage = null;
                    }

                    $part->images()->create([
                        'file_path' => is_array($res) ? ($res['path'] ?? $res[0] ?? null) : $res,
                        'thumb_path' => is_array($res) ? ($res['thumb'] ?? null) : null,
                        'uploader_id' => $uploaderId ?? auth()->id(),
                        'agent_id' => $agentIdForImage ?? ($itemData['agent_id'] ?? null),
                    ]);
                }
            }
        } elseif ($request->hasFile('image')) {
            $file = $request->file('image');
            $res = $this->storeImage($file);
            $uploaderId = $request->input('uploader_id') ?? ($itemData['agent_id'] ?? null) ?? auth()->id();
            if ($uploaderId && !User::where('id', $uploaderId)->exists()) {
                $uploaderId = auth()->id();
            }
            $agentIdSingle = $request->input('agent_id') ?? ($itemData['agent_id'] ?? null);
            if (!empty($agentIdSingle) && !\App\Models\Agent::where('id', $agentIdSingle)->exists()) {
                $agentIdSingle = null;
            }

            $part->images()->create([
                'file_path' => is_array($res) ? ($res['path'] ?? $res[0] ?? null) : $res,
                'thumb_path' => is_array($res) ? ($res['thumb'] ?? null) : null,
                'uploader_id' => $uploaderId,
                'agent_id' => $agentIdSingle,
            ]);
        }

        // optional: create a part_item if provided
        if ($request->has('part_item')) {
            $itemData = $request->input('part_item');
            // If the client sent part_item as a JSON string (FormData), decode it
            if (is_string($itemData)) {
                $decoded = json_decode($itemData, true);
                $itemData = $decoded === null ? [] : $decoded;
            }

            // ensure store_id is provided (use first store as fallback)
            $storeId = $itemData['store_id'] ?? null;
            if (empty($storeId)) {
                $defaultStore = Store::first();
                if ($defaultStore) {
                    $storeId = $defaultStore->id;
                } else {
                    // No store exists: create a sensible default store so uploads don't fail
                    $newStore = Store::create([
                        'name' => 'Default Store',
                        'owner_id' => auth()->id() ?? null,
                        'address' => 'Auto-created',
                    ]);
                    $storeId = $newStore->id;
                }
            }

            $partItem = PartItem::create([
                'part_id' => $part->id,
                'store_id' => $storeId,
                'agent_id' => $itemData['agent_id'] ?? ($part->agent_id ?? null),
                'shelf' => $itemData['shelf'] ?? ($part->shelf ?? null),
                'batch_no' => $itemData['batch_no'] ?? null,
                'serial_number' => $itemData['serial_number'] ?? null,
                'quantity' => $itemData['quantity'] ?? 1,
                'unit_cost' => $itemData['unit_cost'] ?? null,
                'unit_price' => $itemData['unit_price'] ?? null,
                'condition' => $itemData['condition'] ?? 'new',
                'status' => $itemData['status'] ?? 'available',
                'image_ids' => isset($itemData['image_ids'])
                    ? json_encode($itemData['image_ids'])
                    : null,
            ]);

            app(InventoryService::class)->recordInitialStock(
                $partItem,
                auth()->id(),
                'Initial stock from part upload'
            );
        }

        // prepare response data and include agent relation, items (to show condition), and top-level agent_id
        $partWithImages = $part->load('images', 'agent', 'items');

        $agentIdForResponse = null;
        if (!empty($itemData['agent_id'])) {
            $agentIdForResponse = $itemData['agent_id'];
        } else {
            $firstImage = $partWithImages->images->first();
            if ($firstImage && !empty($firstImage->agent_id)) {
                $agentIdForResponse = $firstImage->agent_id;
            }
        }

        $data = $partWithImages->toArray();
        if (empty($data['agent_id']) && !empty($partWithImages->agent_id)) {
            $data['agent_id'] = $partWithImages->agent_id;
        } else {
            $data['agent_id'] = $agentIdForResponse;
        }

        return response()->json([
            'message' => 'Part created successfully',
            'data' => $data,
        ], 201);
    }

    public function update(PartRequest $request, $id)
    {
        $part = Part::findOrFail($id);
        $data = $request->validated();

        // Update part basic fields
        if (array_key_exists('is_active', $data)) {
            $data['is_active'] = DB::raw($request->boolean('is_active') ? 'true' : 'false');
        }
        $part->update($data);

        // Handle optional part_item payload on update similar to store()
        $itemDataRaw = $request->input('part_item');
        $itemData = [];
        if ($itemDataRaw) {
            $itemData = is_string($itemDataRaw) ? (json_decode($itemDataRaw, true) ?: []) : $itemDataRaw;
        }

        if (!empty($itemData)) {
            // ensure store_id exists or fallback to first store
            $storeId = $itemData['store_id'] ?? null;
            if (empty($storeId)) {
                $defaultStore = Store::first();
                if ($defaultStore) {
                    $storeId = $defaultStore->id;
                }
            }

            // Create a new PartItem to record the updated stock/cost/price
            $partItem = PartItem::create([
                'part_id' => $part->id,
                'store_id' => $storeId,
                'agent_id' => $itemData['agent_id'] ?? ($part->agent_id ?? null),
                'shelf' => $itemData['shelf'] ?? ($part->shelf ?? null),
                'batch_no' => $itemData['batch_no'] ?? null,
                'serial_number' => $itemData['serial_number'] ?? null,
                'quantity' => $itemData['quantity'] ?? 1,
                'unit_cost' => $itemData['unit_cost'] ?? null,
                'unit_price' => $itemData['unit_price'] ?? null,
                'condition' => $itemData['condition'] ?? 'new',
                'status' => $itemData['status'] ?? 'available',
                'image_ids' => isset($itemData['image_ids']) ? json_encode($itemData['image_ids']) : null,
            ]);

            app(InventoryService::class)->recordInitialStock(
                $partItem,
                auth()->id(),
                'Stock added while updating part'
            );
        }

        // -------------------- Handle removed images --------------------
        $removeIds = $request->input('remove_image_ids', []);
        if (is_array($removeIds) && count($removeIds) > 0) {
            $disk = config('filesystems.default', 'public');
            foreach ($removeIds as $rid) {
                $img = \App\Models\PartImage::find($rid);
                if ($img) {
                    try {
                        if (!empty($img->file_path)) Storage::disk($disk)->delete($img->file_path);
                        if (!empty($img->thumb_path)) Storage::disk($disk)->delete($img->thumb_path);
                    } catch (\Exception $e) {
                        // ignore failures to delete files
                    }
                    $img->delete();
                }
            }
        }

        // -------------------- Handle newly uploaded images (if any) --------------------
        if ($request->hasFile('images')) {
            $files = $request->file('images');
            $imagesMeta = $request->input('images_meta', []);
            $imagesInput = $request->input('images', []);
            $imagesUploaderIds = $request->input('images_uploader_ids', []);
            $topUploader = $request->input('uploader_id', null);

            if (is_array($files)) {
                foreach ($files as $idx => $file) {
                    $res = $this->storeImage($file);

                    $uploaderId = null;
                    $agentIdForImage = null;

                    if (isset($imagesMeta[$idx]) && is_array($imagesMeta[$idx])) {
                        if (!empty($imagesMeta[$idx]['uploader_id'])) {
                            $uploaderId = $imagesMeta[$idx]['uploader_id'];
                        }
                        if (!empty($imagesMeta[$idx]['agent_id'])) {
                            $agentIdForImage = $imagesMeta[$idx]['agent_id'];
                        }
                    } elseif (isset($imagesInput[$idx]) && is_array($imagesInput[$idx]) && !empty($imagesInput[$idx]['uploader_id'])) {
                        $uploaderId = $imagesInput[$idx]['uploader_id'];
                    } elseif (isset($imagesInput[$idx]) && is_array($imagesInput[$idx]) && !empty($imagesInput[$idx]['agent_id'])) {
                        $agentIdForImage = $imagesInput[$idx]['agent_id'];
                    } elseif (isset($imagesUploaderIds[$idx]) && !empty($imagesUploaderIds[$idx])) {
                        $uploaderId = $imagesUploaderIds[$idx];
                    } elseif (!empty($topUploader)) {
                        $uploaderId = $topUploader;
                    } elseif (!empty($itemData['agent_id'])) {
                        $agentIdForImage = $itemData['agent_id'];
                    }

                    if ($uploaderId && !User::where('id', $uploaderId)->exists()) {
                        $uploaderId = null;
                    }

                    if (!empty($agentIdForImage) && !\App\Models\Agent::where('id', $agentIdForImage)->exists()) {
                        $agentIdForImage = null;
                    }

                    $part->images()->create([
                        'file_path' => is_array($res) ? ($res['path'] ?? $res[0] ?? null) : $res,
                        'thumb_path' => is_array($res) ? ($res['thumb'] ?? null) : null,
                        'uploader_id' => $uploaderId ?? auth()->id(),
                        'agent_id' => $agentIdForImage ?? ($itemData['agent_id'] ?? null),
                    ]);
                }
            }
        }

        // -------------------- Ensure part.condition and part.shelf updated if provided --------------------
        $dirty = false;
        if (!empty($itemData['condition'])) {
            $part->condition = $itemData['condition'];
            $dirty = true;
        }
        if (!empty($itemData['shelf'])) {
            $part->shelf = $itemData['shelf'];
            $dirty = true;
        }
        if ($dirty) {
            $part->save();
        }

        return $this->success($part->load('items', 'images', 'agent'), 'Updated');
    }

    public function destroy($id)
    {
        $part = Part::findOrFail($id);
        $part->delete();
        return $this->success(null, 'Deleted', 204);
    }
}
