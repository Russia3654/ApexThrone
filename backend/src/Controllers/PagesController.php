<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\AdminGuard;
use App\Core\Config;
use App\Core\Database;
use App\Core\Response;

final class PagesController
{
    private array $haystack = ['draft', 'published', 'archived'];
    public function __construct(private Config $config) {}

    public function create(): void
    {
        if ((new AdminGuard())->require($this->config) === null) {
            return;
        }
        $body = $this->readBody();
        if ($body === null) {
            return;
        }
        $page = $this->validate($body);
        if ($page === null) {
            return;
        }
        $mysqli = (new Database($this->config))->connection();
        $query_insert = $mysqli->prepare('INSERT INTO pages (menu_name, slug, `position`, visible, status, max_element) VALUES (?, ?, ?, ?, ?, ?)');
        $query_insert->bind_param(
            'ssiisi',
            $page['menu_name'],
            $page['slug'],
            $page['position'],
            $page['visible'],
            $page['status'],
            $page['max_element'],
        );

        try {
            $query_insert->execute();
        } catch (\mysqli_sql_exception $e) {
            if ($e->getCode() === 1062) {
                Response::error('Slug already used', 409);
                return;
            }
            throw $e;
        }

        $newID = $mysqli->insert_id;
        $query_search = $mysqli->prepare('SELECT ID, menu_name, slug, `position`, visible, status, max_element, created_at, updated_at  FROM pages WHERE ID = ?');
        $query_search->bind_param('i', $newID);
        $query_search->execute();
        $match_row = $query_search->get_result()->fetch_assoc();
        Response::json(['page' => $this->format($match_row)], 201);
    }
    public function list(): void {
        if ((new AdminGuard())->require($this->config) === null) {
            return;
        }

        $mysqli = (new Database($this->config))->connection();
        $query_search = $mysqli->query('SELECT ID, menu_name, slug, `position`, visible, status, max_element, created_at, updated_at FROM pages ORDER BY `position`, ID');
        $rows_founds = $query_search->fetch_all(MYSQLI_ASSOC);
        $pages = array_map([$this, 'format'], $rows_founds);
        Response::json(['pages' => $pages]);
    }

    private function readBody(): ?array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            Response::error('Invalid JSON', 400);
            return null;
        }
        return $data;
    }
    private function validate(array $data): ?array
    {
        $menu_name  = $data['menu_name'] ?? null;
        $slug = $data['slug'] ?? null;
        $position = $data['position'] ?? null;
        $visible = $data['visible'] ?? null;
        $status = $data['status'] ?? null;
        $max_element = $data['max_element'] ?? null;

        if (
            !is_string($menu_name) || !is_string($slug) ||
            !is_int($position) || !is_int($visible) ||
            !in_array($status, $this->haystack, true) ||
            !is_int($max_element) || !preg_match('/^[a-z0-9-]+$/', $slug) ||
            $menu_name === '' || $slug === '' ||
            $position < 1 || !in_array($visible, [0, 1], true) ||
            strlen($menu_name) > 100|| strlen($slug) > 100 ||
            $max_element < 1 || $max_element > 100
        ) {
            Response::error('Invalid data', 400);
            return null;
        }
        return [
            'menu_name' => $menu_name,
            'slug' => $slug,
            'position' => $position,
            'visible' => $visible,
            'status' => $status,
            'max_element' => $max_element];
    }
    private function format(array $row): array
    {
        return [
            'id' => (int) $row['ID'],
            'menu_name' => $row['menu_name'],
            'slug' => $row['slug'],
            'position' => (int) $row['position'],
            'visible' => (bool) $row['visible'],
            'status' => $row['status'],
            'max_element' => (int) $row['max_element'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }
}
