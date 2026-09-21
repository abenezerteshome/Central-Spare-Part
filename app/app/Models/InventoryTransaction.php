<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class InventoryTransaction extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'part_item_id',
        'part_id',
        'change',
        'type',
        'ref_id',
        'actor_id',
        'note',
    ];

    protected $casts = [
        'change' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function partItem()
    {
        return $this->belongsTo(PartItem::class);
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
