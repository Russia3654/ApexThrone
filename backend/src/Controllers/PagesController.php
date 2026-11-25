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
        if ($page['parent_ID'] === null) {
            Response::error('Invalid data', 400);
            return;
        }

        $mysqli = (new Database($this->config))->connection();
        if (!$this->isValidParent($mysqli, $page['parent_ID'])) {
            return;
        }
        $query_insert = $mysqli->prepare('INSERT INTO pages (parent_ID, menu_name, slug, `position`, visible, status, max_element) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $query_insert->bind_param(
            'issiisi',
            $page['parent_ID'],
            $page['menu_name'],
            $page['slug'],
            $page['position'],
            $page['visible'],
            $page['status'],
            $page['max_element'],
        );

        if (!$this->validateQuery($query_insert)) {
            return;
        }

        $newID = $mysqli->insert_id;
        $match_row = $this->findPage($mysqli, $newID);
        Response::json(['page' => $this->format($match_row)], 201);
    }
    public function list(): void
    {
        if ((new AdminGuard())->require($this->config) === null) {
            return;
        }

        $mysqli = (new Database($this->config))->connection();
        $query_search = $mysqli->query('SELECT ID, parent_ID, menu_name, slug, `position`, visible, status, max_element, created_at, updated_at FROM pages ORDER BY `position`, ID');
        $rows_founds = $query_search->fetch_all(MYSQLI_ASSOC);
        $pages = array_map([$this, 'format'], $rows_founds);
        Response::json(['pages' => $pages]);
    }
    public function show(): void
    {
        if ((new AdminGuard())->require($this->config) === null) {
            return;
        }
        $id = $this->readId();
        if ($id === null) {
            return;
        }
        $mysqli = (new Database($this->config))->connection();
        $match_row = $this->findPage($mysqli, $id);
        if ($match_row === null) {
            Response::error('Page not found', 404);
            return;
        }
        Response::json(['page' => $this->format($match_row)]);
    }
    public function update(): void
    {
        if ((new AdminGuard())->require($this->config) === null) {
            return;
        }
        $id = $this->readId();
        if ($id === null) {
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
        $existing = $this->findPage($mysqli, $id);
        if ($existing === null) {
            Response::error('Page not found', 404);
            return;
        }
        if ($existing['parent_ID'] === null) {
            if ($page['parent_ID'] !== null || $existing['slug'] !== $page['slug']) {
                Response::error('Core page structure cannot change', 409);
                return;
            }
            if (strlen($page['menu_name']) > 20) {
                Response::error('Core page name is too long', 400);
                return;
            }
        } else {
            if ($page['parent_ID'] === null) {
                Response::error('Invalid data', 400);
                return;
            }
            if (!$this->isValidParent($mysqli, $page['parent_ID'])) {
                return;
            }
        }

        $query_update = $mysqli->prepare('UPDATE pages SET parent_ID = ? ,menu_name = ?, slug = ?, `position` = ?, visible = ?, status = ?, max_element = ? WHERE ID = ?');
        $query_update->bind_param(
            'issiisii',
            $page['parent_ID'],
            $page['menu_name'],
            $page['slug'],
            $page['position'],
            $page['visible'],
            $page['status'],
            $page['max_element'],
            $id,
        );

        if (!$this->validateQuery($query_update)) {
            return;
        }
        Response::json(['page' => $this->format($this->findPage($mysqli, $id))]);
    }
    public function delete(): void
    {
        if ((new AdminGuard())->require($this->config) === null) {
            return;
        }
        $id = $this->readId();
        if ($id === null) {
            return;
        }

        $mysqli = (new Database($this->config))->connection();
        $query_delete = $mysqli->prepare('DELETE FROM pages WHERE ID = ?');
        $query_delete->bind_param('i', $id);
        $query_delete->execute();
        if ($query_delete->affected_rows === 0) {
            Response::error('Page not found', 404);
            return;
        }
        Response::json(['ok' => true]);
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
        $parent_ID = $data['parent_ID'] ?? null;
        $menu_name  = $data['menu_name'] ?? null;
        $slug = $data['slug'] ?? null;
        $position = $data['position'] ?? null;
        $visible = $data['visible'] ?? null;
        $status = $data['status'] ?? null;
        $max_element = $data['max_element'] ?? null;

        if (
            (isset($parent_ID) && (!is_int($parent_ID) || $parent_ID < 1)) ||
            !is_string($menu_name) || !is_string($slug) ||
            !is_int($position) || !is_int($visible) ||
            !in_array($status, $this->haystack, true) ||
            !is_int($max_element) || !preg_match('/^[a-z0-9-]+$/D', $slug) ||
            $menu_name === '' || $slug === '' ||
            $position < 1 || !in_array($visible, [0, 1], true) ||
            strlen($menu_name) > 100 || strlen($slug) > 100 ||
            $max_element < 1 || $max_element > 100
        ) {
            Response::error('Invalid data', 400);
            return null;
        }
        return [
            'parent_ID' => $parent_ID,
            'menu_name' => $menu_name,
            'slug' => $slug,
            'position' => $position,
            'visible' => $visible,
            'status' => $status,
            'max_element' => $max_element
        ];
    }
    private function format(array $row): array
    {
        return [
            'id' => (int) $row['ID'],
            'parent_ID' => $row['parent_ID'] === null ? null : (int) $row['parent_ID'],
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
    private function readId(): ?int
    {
        $id = $_GET['id'] ?? null;
        if (filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) === false) {
            Response::error('Invalid id', 400);
            return null;
        }
        return (int) $id;
    }
    private function findPage(\mysqli $mysqli, int $id): ?array
    {
        $query_search = $mysqli->prepare('SELECT ID, parent_ID, menu_name, slug, `position`, visible, status, max_element, created_at, updated_at  FROM pages WHERE ID = ?');
        $query_search->bind_param('i', $id);
        $query_search->execute();
        return $query_search->get_result()->fetch_assoc();
    }
    private function validateQuery(\mysqli_stmt $query): bool
    {
        try {
            $query->execute();
            return true;
        } catch (\mysqli_sql_exception $e) {
            if ($e->getCode() === 1062) {
                Response::error('Slug already used', 409);
                return false;
            }
            throw $e;
        }
    }

    private function isValidParent(\mysqli $mysqli, int $parentID): bool
    {
        $page = $this->findPage($mysqli, $parentID);
        if ($page === null) {
            Response::error('Parent page not found', 404);
            return false;
        }
        if ($page['parent_ID'] !== null) {
            Response::error('Parent must be a core page', 409);
            return false;
        }
        return true;
    }
}
