<?php
// Copy to config.php and fill in. Never commit config.php.
return [
    // allowed values ('development', 'production').
    'env' => 'development',
    'app' => [
        // used for links in emails, with no trailing slash.
        'base_url' => 'http://localhost:8000',
        // false only for plain-HTTP development, true wherever HTTPS is used.
        'cookie_secure' => false,
    ],
    'db' => [
        'dsn' => 'mysql:host=127.0.0.1;port=3306;dbname=<name>;charset=utf8mb4',
        'user' => '<db user>',
        'password' => '<db password>',
    ],
    'mail' => [
        // 'smtp' or 'log'
        'transport' => 'log',
        'host' => '',
        'port' => 587,
        'user' => '',
        'password' => '',
        'from' => '',
    ],
];