<?php

declare(strict_types=1);

namespace App\Core;

final class Session
{
    public function start(Config $config): void
    {
        $cookie_secure = $config->get("app.cookie_secure");
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        if ($cookie_secure === true) {
            $secure = true;
        } elseif ($cookie_secure === false) {
            $secure = false;
        } elseif ($cookie_secure === 'auto') { 
            $secure = ($_SERVER['HTTPS'] ?? '') === 'on';
        } else {
            throw new \RuntimeException('unknown secure value');
        }

        session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $secure, 'httponly' => true, 'samesite' => 'Lax']);
        ini_set('session.use_strict_mode', '1');
        session_start();
    }
}
