<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PartImage extends Model
{
    use HasFactory;

    protected $appends = ['url', 'thumb_url'];

    // Table name
    protected $table = 'part_images';

    // UUID primary key
    protected $keyType = 'string';
    public $incrementing = false;

    // Fillable fields
    protected $fillable = [
        'id',
        'part_id',
        'part_item_id',
        'uploader_id',
        'agent_id',
        'file_path',
        'thumb_path',
        'phash',
        'width',
        'height',
    ];

    // Automatically generate UUID on create
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    public function partItem()
    {
        return $this->belongsTo(PartItem::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    // Accessors for URLs (optional)
    public function getUrlAttribute()
    {
        return $this->file_path
            ? asset('storage/' . $this->file_path)
            : null;
    }

    public function getThumbUrlAttribute()
    {
        return $this->thumb_path
            ? asset('storage/' . $this->thumb_path)
            : null;
    }
}
