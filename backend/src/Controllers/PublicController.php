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

    public function page(): void
    {
        $slug = $_GET['slug'] ?? '';
        if (!is_string($slug) || !preg_match('/^[a-z0-9-]+$/D', $slug) || strlen($slug) > 100) {
            Response::error('Invalid slug', 400);
            return;
        }

        $mysqli = (new Database($this->config))->connection();
        $query_search = $mysqli->prepare("SELECT ID, menu_name, slug FROM pages WHERE slug = ? AND visible = 1 AND status = 'published'");
        $query_search->bind_param('s', $slug);
        $query_search->execute();
        $page = $query_search->get_result()->fetch_assoc();
        if ($page === null) {
            Response::error('Page not found', 404);
            return;
        }

        $query_search = $mysqli->prepare("SELECT ID AS id, menu_name, content FROM subjects WHERE page_ID = ? AND visible = 1 AND status = 'published' ORDER BY `position`, ID");
        $query_search->bind_param('i', $page['ID']);
        $query_search->execute();
        $query_result = $query_search->get_result();
        $subject = $query_result->fetch_all(MYSQLI_ASSOC);
        
        Response::json(['page' => [
            'menu_name' => $page['menu_name'],
            'slug' => $page['slug'],
            'subjects' => $subject,
            ]]);
    }
}
