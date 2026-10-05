<?php

return [
    'paths' => ['*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_filter(array_merge(
        [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:9999',
            'https://central.wheelofnamees.com',
            'https://www.central.wheelofnamees.com',
            'https://api-central.wheelofnamees.com',
        ],
        explode(',', env('FRONTEND_URL', ''))
    )),
    'allowed_origins_patterns' => [
        '#^https://.*\.wheelofnamees\.com$#',
        '#^https://.*\.vercel\.app$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['*'],
    'max_age' => 86400,
    'supports_credentials' => true,
];
