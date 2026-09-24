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
        $awsBucket = env('AWS_BUCKET');
        $awsKey = env('AWS_ACCESS_KEY_ID');

        // 1. Try S3 Cloud Storage if AWS credentials are configured
        if (!empty($awsBucket) && !empty($awsKey)) {
            try {
                $path = $file->storePublicly($folder, 's3');
                $thumbPath = null;

                try {
                    $manager = new ImageManager(new Driver());
                    $img = $manager->read($file->getRealPath())
                        ->resize(400, 300, function ($constraint) {
                            $constraint->aspectRatio();
                            $constraint->upsize();
                        });

                    $thumbName = 'thumb_' . basename($path);
                    $thumbPath = $folder . '/' . $thumbName;
                    $extension = strtolower(pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION));
                    $encoder = $extension === 'png' ? new PngEncoder() : new JpegEncoder(quality: 75);
                    $encoded = $img->encode($encoder);

                    Storage::disk('s3')->put($thumbPath, $encoded, 'public');
                } catch (\Throwable $e) {
                    $thumbPath = null;
                }

                return [
                    'path' => $path,
                    'thumb' => $thumbPath,
                ];
            } catch (\Throwable $e) {
                // If S3 upload fails, fall through to Data URL fallback
            }
        }

        // 2. Fallback for Serverless / Vercel without external S3:
        // Resize & compress in-memory, convert to Data URL (base64) and store directly in Database
        try {
            $manager = new ImageManager(new Driver());
            $realPath = $file->getRealPath();

            // Original Image (compressed max 800x600)
            $fullImg = $manager->read($realPath)
                ->resize(800, 600, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            $encodedFull = $fullImg->encode(new JpegEncoder(quality: 75));
            $fullDataUrl = 'data:image/jpeg;base64,' . base64_encode((string)$encodedFull);

            // Thumbnail Image (compressed max 300x225)
            $thumbImg = $manager->read($realPath)
                ->resize(300, 225, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            $encodedThumb = $thumbImg->encode(new JpegEncoder(quality: 70));
            $thumbDataUrl = 'data:image/jpeg;base64,' . base64_encode((string)$encodedThumb);

            return [
                'path' => $fullDataUrl,
                'thumb' => $thumbDataUrl,
            ];
        } catch (\Throwable $e) {
            // Raw base64 fallback if image manager fails
            $content = file_get_contents($file->getRealPath());
            $mime = $file->getMimeType() ?: 'image/jpeg';
            $dataUrl = 'data:' . $mime . ';base64,' . base64_encode($content);
            return [
                'path' => $dataUrl,
                'thumb' => $dataUrl,
            ];
        }
    }
}
