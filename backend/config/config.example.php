<?php
// Copy to config.php and fill in. Never commit config.php.
return [
    // allowed values ('development', 'production').
    'env' => 'development',
    'app' => [
        // base URL of the site, with no trailing slash
        'base_url' => 'http://localhost:8000',
        // used for cookie security. true = only sent over HTTPS, false = sent over HTTP and HTTPS, 'auto' = automatically set based on the request.
        'cookie_secure' => 'auto',
        // 'bcrypt' (default) or 'md5' (refused when env is 'production').
        'password_algo' => 'bcrypt',
    ],
    'db' => [
        'host' => 'localhost',
        'name' => 'apexthrone',
        'user' => '<db user>',
        'password' => '<db password>',
    ],
];