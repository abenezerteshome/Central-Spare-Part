<?php

return [
    'paths' => ['*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_filter(array_merge(
        ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:9999'],
        explode(',', env('FRONTEND_URL', ''))
    )),
    'allowed_origins_patterns' => ['#^https://.*\.vercel\.app$#'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];

