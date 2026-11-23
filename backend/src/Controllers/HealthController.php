<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Config;
use App\Core\Database;
use App\Core\Response;

final class HealthController
{
    public function __construct(private Config $config) {}

    public function status(): void
    {
        Response::json(['status' => 'ok', 'time' => gmdate('c')]);
    }

    public function db(): void
    {
        $mysqli = (new Database($this->config))->connection();
        $mysqli->query('SELECT 1');
        Response::json(['db' => 'ok']);
    }
}
