<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Part extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id','sku','part_number','name','brand_id','category_id','description','shelf','condition','unit_cost','unit_price','technical_specs','is_active','agent_id'];
    protected $casts = ['technical_specs' => 'array', 'is_active' => 'boolean', 'unit_cost' => 'decimal:2', 'unit_price' => 'decimal:2'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }

    protected $appends = ['total_quantity'];

    public function getTotalQuantityAttribute()
    {
        if ($this->relationLoaded('items')) {
            return (int) $this->items->sum('quantity');
        }
        return (int) $this->items()->sum('quantity');
    }

    public function brand(){ return $this->belongsTo(Brand::class); }
    public function category(){ return $this->belongsTo(Category::class); }
    public function items(){ return $this->hasMany(PartItem::class); }
    public function images(){ return $this->hasMany(PartImage::class); }
    public function agent(){ return $this->belongsTo(Agent::class); }
}
