<?php

declare(strict_types=1);

namespace App\Core;

use Throwable;

final class ErrorHandler
{
    public static function register(): void
    {
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');
        set_exception_handler([self::class, 'handle']);
        set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
            throw new \ErrorException($message, 0, $severity, $file, $line);
        });
    }
    
    public static function handle(Throwable $e): void
    {
        $line = sprintf('%s: %s in %s on line %d', $e::class, $e->getMessage(), $e->getFile(), $e->getLine());
        error_log($line);
        Response::error('Internal server error', 500);
    }
}