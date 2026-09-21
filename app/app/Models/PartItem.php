<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PartItem extends Model
{
    protected $table = 'part_items';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id','part_id','store_id','agent_id','shelf','batch_no','serial_number','quantity','unit_cost','unit_price','condition','status','image_ids'];
    protected $casts = ['image_ids' => 'array'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }

    public function part(){ return $this->belongsTo(Part::class); }
    public function store(){ return $this->belongsTo(Store::class); }
    public function agent(){ return $this->belongsTo(Agent::class); }
    public function items()
{
    return $this->hasMany(PartItem::class);
}

}
