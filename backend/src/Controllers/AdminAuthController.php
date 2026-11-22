<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\AdminGuard;
use App\Core\Config;
use App\Core\Database;
use App\Core\Password;
use App\Core\Response;
use App\Core\Session;

final class AdminAuthController
{
    private const MAX_ATTEMPTS = 5;
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
        $query_search_attempts  = $mysqli->prepare('SELECT COUNT(*) FROM login_attempts WHERE identifier = ? AND attempted_at > (NOW() - INTERVAL 15 MINUTE)');
        $query_search_attempts->bind_param('s', $username);
        $query_search_attempts->execute();
        $attempts = (int) $query_search_attempts->get_result()->fetch_row()[0];

        if ($attempts >= self::MAX_ATTEMPTS) {
            header('Retry-After: 900');
            Response::error('Too many attempts, try again later', 429);
            return;
        }

        $query_search = $mysqli->prepare('SELECT ID, first_name, last_name, username, password FROM admins WHERE username = ?');
        $query_search->bind_param('s', $username);
        $query_search->execute();
        $match_row = $query_search->get_result()->fetch_assoc();



        $password_checker = new Password($this->config);
        if ($match_row === null || !$password_checker->verify($password, $match_row['password'])) {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
            $query_insert = $mysqli->prepare('INSERT INTO login_attempts (identifier, ip_address) VALUES (?, ?)');
            $query_insert->bind_param('ss', $username, $ip);
            $query_insert->execute();
            Response::error('Invalid credentials', 401);
            return;
        }

        $query_delete = $mysqli->prepare('DELETE FROM login_attempts WHERE identifier = ?');
        $query_delete->bind_param('s', $username);
        $query_delete->execute();

        (new Session())->start($this->config);
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $match_row['ID'];
        $_SESSION['last_activity'] = time();
        Response::json(['admin' => [
            'id'         => (int) $match_row['ID'],
            'username'   => $match_row['username'],
            'first_name' => $match_row['first_name'],
            'last_name'  => $match_row['last_name'],
        ]]);
    }

    public function me(): void
    {
        $id = (new AdminGuard())->require($this->config);
        if ($id === null) {
            return;
        }
        $mysqli = (new Database($this->config))->connection();
        $query_search = $mysqli->prepare('SELECT ID, first_name, last_name, username FROM admins WHERE ID = ?');
        $query_search->bind_param('i', $id);
        $query_search->execute();
        $match_row = $query_search->get_result()->fetch_assoc();
        if ($match_row === null) {
            $_SESSION = [];
            session_destroy();
            Response::error('Not logged in', 401);
            return;
        }
        Response::json(['admin' => [
            'id'         => (int) $match_row['ID'],
            'username'   => $match_row['username'],
            'first_name' => $match_row['first_name'],
            'last_name'  => $match_row['last_name'],
        ]]);
    }

    public function logout(): void
    {
        (new Session())->start($this->config);
        $_SESSION = [];
        $param = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $param['path'], 'secure' => $param['secure'], 'httponly' => $param['httponly'], 'samesite' => $param['samesite']]);
        session_destroy();
        Response::json(['ok' => true]);
    }
}
