<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $fillable = ['part_id', 'store_id', 'quantity'];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
