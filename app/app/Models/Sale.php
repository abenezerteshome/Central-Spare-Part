<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sale extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id','order_number','buyer_name','buyer_phone','buyer_location','product_detail','created_by','total','tax','discount','status'];
    protected $appends = ['date'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
            if (empty($model->order_number)) $model->order_number = 'CSP' . strtoupper(substr((string) Str::uuid(),0,8));
        });
    }

    public function items(){ return $this->hasMany(SaleItem::class); }

    /**
     * Present a normalized status for frontend compatibility.
     * Maps legacy statuses to: pending, buyed, rejected
     */
    public function getStatusAttribute($value)
    {
        // map old DB values to new frontend-friendly values
        $map = [
            'draft' => 'pending',
            'confirmed' => 'buyed',
            'shipped' => 'buyed',
            'completed' => 'buyed',
            'returned' => 'rejected',
        ];

        return $map[$value] ?? $value;
    }

    /**
     * Add a `date` attribute (readable) based on `created_at`.
     */
    public function getDateAttribute()
    {
        if ($this->created_at) {
            return $this->created_at->toDateTimeString();
        }
        return null;
    }
}
