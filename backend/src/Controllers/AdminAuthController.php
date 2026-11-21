<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Config;
use App\Core\Database;
use App\Core\Password;
use App\Core\Response;
use App\Core\Session;

final class AdminAuthController
{
    public function __construct(private Config $config) {}

    public function login(): void
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            Response::error('Invalid JSON', 400);
            return;
        }

        $username = $data['username'] ?? null;
        $password = $data['password'] ?? null;
        if (
            !is_string($username) || !is_string($password) ||
            $username === '' || $password === '' ||
            strlen($username) > 50 || strlen($password) > 200
        ) {
            Response::error('Invalid data', 400);
            return;
        }

        $mysqli = (new Database($this->config))->connection();
        $query_search = $mysqli->prepare('SELECT ID, first_name, last_name, username, password FROM admins WHERE username = ?');
        $query_search->bind_param('s', $username);
        $query_search->execute();
        $match_row = $query_search->get_result()->fetch_assoc();

        $password_checker = new Password($this->config);
        if ($match_row === null || !$password_checker->verify($password, $match_row['password'])) {
            Response::error('Invalid credentials', 401);
            return;
        }

        (new Session())->start($this->config);
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $match_row['ID'];
        Response::json(['admin' => [
            'id'         => (int) $match_row['ID'],
            'username'   => $match_row['username'],
            'first_name' => $match_row['first_name'],
            'last_name'  => $match_row['last_name'],
        ]]);
    }
}
