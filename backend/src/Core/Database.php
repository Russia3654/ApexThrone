<?php

declare(strict_types=1);

namespace App\Core;

use mysqli;

final class Database
{
    private mysqli $connection;

    public function __construct(Config $config)
    {
        $host = (string) $config->get('db.host');
        $user = (string) $config->get('db.user');
        $password = (string) $config->get('db.password');
        $name = (string) $config->get('db.name');

        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        $this->connection = new mysqli($host, $user, $password, $name);
        $this->connection->set_charset('utf8mb4');
        $this->connection->query("SET time_zone = '+00:00'");
    }

    public function connection(): mysqli
    {
        return $this->connection;
    }
}