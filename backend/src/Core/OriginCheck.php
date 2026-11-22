<?php

declare(strict_types=1);

namespace App\Core;

final class OriginCheck
{
    public function check(): bool
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
        if ($origin === null) {
            return true;
        }
        $host = parse_url($origin, PHP_URL_HOST);
        $port = parse_url($origin, PHP_URL_PORT);
        if (!is_string($host)){
            return false;
        }
        $build = strtolower($host);
        if ($port !== null) {
            $build .= ':'. $port;
        }
        return $build === strtolower($_SERVER['HTTP_HOST'] ?? '');
    }
}
