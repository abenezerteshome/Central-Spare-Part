<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver; 

trait HandlesImages
{
    /**
     * Store an image and create a compressed thumbnail
     * Optimized for performance by avoiding file mirroring (use symlink instead)
     */
    public function storeImage(UploadedFile $file, $folder = 'parts')
    {
        // Store the original file
        $path = $file->storePublicly($folder, 'public');
        $thumbPath = null;

        try {
            // Create thumbnail with compression
            $manager = new ImageManager(new Driver());
            
            // Read and resize the original in-memory, compress for thumbnail
            $img = $manager->read($file->getRealPath())
                ->resize(400, 300, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });

            // Generate thumbnail with quality compression
            $thumbName = 'thumb_' . basename($path);
            $thumbPath = $folder . '/' . $thumbName;
            
            // Encode with compression (80% quality for JPEG, 8 colors for PNG)
            $encoded = $img->encode(
                format: pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION) === 'png' ? 'png' : 'jpeg',
                quality: 75
            );
            
            Storage::disk('public')->put($thumbPath, $encoded);

        } catch (\Exception $e) {
            // If thumbnail creation fails, continue without it
            $thumbPath = null;
        }

        return [
            'path' => $path,
            'thumb' => $thumbPath,
        ];
    }
}
