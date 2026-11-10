<?php
declare(strict_types=1);

namespace App\Core;

final class Response
{
    public static function json(mixed $data, int $status = 200):void 
    {
        $body = json_encode($data, JSON_THROW_ON_ERROR);
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo $body;
    }

    public static function error(string $message,int $status):void 
    {
        self::json(['error' => $message], $status);
    }
}
