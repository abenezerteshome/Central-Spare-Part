<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Drivers\Gd\Encoders\JpegEncoder;
use Intervention\Image\Drivers\Gd\Encoders\PngEncoder;

trait HandlesImages
{
    /**
     * Store an image and create a compressed thumbnail.
     * Tries S3 first (if AWS credentials are configured), then falls back to
     * a base64 Data URL stored directly in the database (for Vercel / serverless).
     */
    public function storeImage(UploadedFile $file, $folder = 'parts')
    {
        $awsBucket = env('AWS_BUCKET');
        $awsKey = env('AWS_ACCESS_KEY_ID');

        // 1. Try S3 Cloud Storage if AWS credentials are configured
        if (!empty($awsBucket) && !empty($awsKey)) {
            try {
                $path = $file->storePublicly($folder, 's3');
                if (!$path) {
                    throw new \RuntimeException('S3 storePublicly failed (returned false)');
                }
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

                    $putOk = Storage::disk('s3')->put($thumbPath, $encoded, 'public');
                    if (!$putOk) {
                        $thumbPath = null;
                    }
                } catch (\Throwable $e) {
                    Log::warning('HandlesImages: S3 thumbnail creation failed', [
                        'error' => $e->getMessage(),
                        'file'  => $file->getClientOriginalName(),
                    ]);
                    $thumbPath = null;
                }

                return [
                    'path'  => $path,
                    'thumb' => $thumbPath,
                ];
            } catch (\Throwable $e) {
                Log::warning('HandlesImages: S3 upload failed, trying local public disk', [
                    'error'  => $e->getMessage(),
                    'bucket' => $awsBucket,
                    'file'   => $file->getClientOriginalName(),
                ]);
            }
        }

        // 2. Try Local Public Storage (for persistent VPS / hosting like LiteSpeed)
        try {
            $path = $file->storePublicly($folder, 'public');
            if ($path) {
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

                    Storage::disk('public')->put($thumbPath, $encoded, 'public');
                } catch (\Throwable $e) {
                    $thumbPath = null;
                }

                return [
                    'path'  => $path,
                    'thumb' => $thumbPath,
                ];
            }
        } catch (\Throwable $e) {
            Log::info('HandlesImages: local public disk store failed, falling back to base64 Data URL', [
                'error' => $e->getMessage(),
            ]);
        }

        // 2. Fallback for Serverless / Vercel without external S3:
        // Resize & compress in-memory, then convert to Data URL (base64) stored in the DB.
        // NOTE: The part_images.file_path and thumb_path columns MUST be TEXT (not VARCHAR 255).
        try {
            $manager = new ImageManager(new Driver());
            $realPath = $file->getRealPath();

            // Full image: max 800×600, JPEG quality 75
            $fullImg = $manager->read($realPath)
                ->resize(800, 600, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            $encodedFull  = $fullImg->encode(new JpegEncoder(quality: 75));
            $fullDataUrl  = 'data:image/jpeg;base64,' . base64_encode((string) $encodedFull);

            // Thumbnail: max 300×225, JPEG quality 70
            $thumbImg = $manager->read($realPath)
                ->resize(300, 225, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            $encodedThumb = $thumbImg->encode(new JpegEncoder(quality: 70));
            $thumbDataUrl = 'data:image/jpeg;base64,' . base64_encode((string) $encodedThumb);

            Log::info('HandlesImages: stored image as base64 Data URL', [
                'file'      => $file->getClientOriginalName(),
                'full_len'  => strlen($fullDataUrl),
                'thumb_len' => strlen($thumbDataUrl),
            ]);

            return [
                'path'  => $fullDataUrl,
                'thumb' => $thumbDataUrl,
            ];
        } catch (\Throwable $e) {
            Log::error('HandlesImages: base64 encoding failed, using raw fallback', [
                'error' => $e->getMessage(),
                'file'  => $file->getClientOriginalName(),
            ]);
            // Raw base64 last-resort fallback
            $content = file_get_contents($file->getRealPath());
            $mime    = $file->getMimeType() ?: 'image/jpeg';
            $dataUrl = 'data:' . $mime . ';base64,' . base64_encode($content);
            return [
                'path'  => $dataUrl,
                'thumb' => $dataUrl,
            ];
        }
    }
}
