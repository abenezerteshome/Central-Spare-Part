<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Store extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id','name','owner_id','address','city','phone','gps_lat','gps_lng','is_active'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }

   
    public function partItems() {
    return $this->hasMany(PartItem::class);
}
}

