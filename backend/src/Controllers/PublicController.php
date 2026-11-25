<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Config;
use App\Core\Database;
use App\Core\Response;

final class PublicController
{
    public function __construct(private Config $config) {}

    public function menu(): void
    {
        $mysqli = (new Database($this->config))->connection();
        $query_search = $mysqli->query("SELECT menu_name, slug FROM pages WHERE visible = 1 AND status = 'published' ORDER BY `position`, ID");
        $rows = $query_search->fetch_all(MYSQLI_ASSOC);
        Response::json(['menu' => $rows]);
    }
}
