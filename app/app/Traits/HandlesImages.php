<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver; 
use Intervention\Image\Drivers\Gd\Encoders\JpegEncoder;
use Intervention\Image\Drivers\Gd\Encoders\PngEncoder;

trait HandlesImages
{
    /**
     * Store an image and create a compressed thumbnail
     * Optimized for performance by avoiding file mirroring (use symlink instead)
     */
    public function storeImage(UploadedFile $file, $folder = 'parts')
    {
        $disk = config('filesystems.default', 's3');

        // Store the original file
        $path = $file->storePublicly($folder, $disk);
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
            $extension = strtolower(pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION));
            $encoder = $extension === 'png'
                ? new PngEncoder()
                : new JpegEncoder(quality: 75);
            $encoded = $img->encode($encoder);
            
            Storage::disk($disk)->put($thumbPath, $encoded, 'public');

        } catch (\Throwable $e) {
            // If thumbnail creation fails, continue without it
            $thumbPath = null;
        }

        return [
            'path' => $path,
            'thumb' => $thumbPath,
        ];
    }
}
