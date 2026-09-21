<?php

return [
    'credentials' => storage_path('app/' . env('FIREBASE_CREDENTIALS')),
    'project_id' => env('FIREBASE_PROJECT_ID'),
    's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'url' => env('AWS_URL'),
    'visibility' => 'public',
],


];

