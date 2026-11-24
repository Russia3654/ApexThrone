<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\AdminGuard;
use App\Core\Config;
use App\Core\Database;
use App\Core\Response;

final class SubjectsController
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
        $subject = $this->validate($body);
        if ($subject === null) {
            return;
        }
        $mysqli = (new Database($this->config))->connection();
        $query_search = $mysqli->prepare('SELECT max_element FROM pages WHERE ID = ?');
        $query_search->bind_param('i', $subject['page_ID']);
        $query_search->execute();

        $row_found = $query_search->get_result()->fetch_row();
        if ($row_found === null) {
            Response::error('Page not found', 404);
            return;
        }
        $max = (int) $row_found[0];

        $query_search = $mysqli->prepare('SELECT COUNT(*) FROM subjects WHERE page_ID = ?');
        $query_search->bind_param('i', $subject['page_ID']);
        $query_search->execute();

        $row_found = $query_search->get_result()->fetch_row();
        $count = (int) $row_found[0];
        if ($count >= $max) {
            Response::error('Page is full', 409);
            return;
        }
        $query_insert = $mysqli->prepare('INSERT INTO subjects(page_ID, menu_name, position, visible, content, status) VALUES (?, ?, ?, ?, ?, ?)');
        $query_insert->bind_param(
            'isiiss',
            $subject['page_ID'],
            $subject['menu_name'],
            $subject['position'],
            $subject['visible'],
            $subject['content'],
            $subject['status'],
        );
        $query_insert->execute();

        $newID = $mysqli->insert_id;
        $match_row = $this->findSubject($mysqli, $newID);
        Response::json(['subject' => $this->format($match_row)], 201);
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
        $page_ID = $data['page_ID'] ?? null;
        $menu_name  = $data['menu_name'] ?? null;
        $position = $data['position'] ?? null;
        $visible = $data['visible'] ?? null;
        $content = $data['content'] ?? null;
        $status = $data['status'] ?? null;

        if (
            !is_int($page_ID) || !is_string($menu_name) ||
            !is_int($position) || !is_int($visible) ||
            !in_array($status, $this->haystack, true) ||
            !is_string($content) || $page_ID < 1 || $menu_name === '' ||
            $position < 1 || !in_array($visible, [0, 1], true) ||
            strlen($menu_name) > 100 || strlen($content) > 20000
        ) {
            Response::error('Invalid data', 400);
            return null;
        }
        return [
            'page_ID' => $page_ID,
            'menu_name' => $menu_name,
            'position' => $position,
            'visible' => $visible,
            'content' => $content,
            'status' => $status,
        ];
    }

    private function format(array $row): array
    {
        return [
            'id' => (int) $row['ID'],
            'page_ID' => (int) $row['page_ID'],
            'menu_name' => $row['menu_name'],
            'position' => (int) $row['position'],
            'visible' => (bool) $row['visible'],
            'content' => $row['content'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }

    private function findSubject(\mysqli $mysqli, int $id): ?array
    {
        $query_search = $mysqli->prepare('SELECT ID, page_ID, menu_name, position, visible, content, status, image_ID, created_at, updated_at FROM subjects WHERE ID = ?');
        $query_search->bind_param('i', $id);
        $query_search->execute();
        return $query_search->get_result()->fetch_assoc();
    }
}
