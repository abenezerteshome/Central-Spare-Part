<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SaleItem extends Model
{
    protected $table = 'sale_items';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id','sale_id','part_item_id','part_id','qty','unit_price','unit_cost','subtotal'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }

    public function sale(){ return $this->belongsTo(Sale::class); }
    public function partItem(){ return $this->belongsTo(PartItem::class, 'part_item_id'); }
    public function part(){ return $this->belongsTo(Part::class); }
}
