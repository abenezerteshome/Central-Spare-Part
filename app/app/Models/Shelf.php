<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Shelf extends Model
{
    protected $table = 'shelves';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['id', 'name', 'description'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}
