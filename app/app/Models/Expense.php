<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Expense extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id','title','amount','currency','category','paid_by','date','receipt_image_id','notes'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) $model->id = (string) Str::uuid();
        });
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
    
    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
    
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
