<?php
declare(strict_types=1);

namespace App\Core;

final class AdminGuard {
    public function require(Config $config): ?int 
    {
        (new Session())->start($config);

        if (!isset($_SESSION['admin_id']) || !is_int($_SESSION['admin_id'])){
            Response::error('Not logged in', 401);
            return null;
        }

        $last = $_SESSION['last_activity'] ?? 0;
        if (time() - $last > 1800) {
            $_SESSION = [];
            session_destroy();
            Response::error('Session expired', 401);
            return null;
        }

        $_SESSION['last_activity'] = time();
        return $_SESSION['admin_id'];
    }
}