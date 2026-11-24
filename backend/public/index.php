<?php

declare(strict_types=1);

use App\Core\Router;
use App\Core\Config;
use App\Core\ErrorHandler;
use App\Controllers\HealthController;
use App\Controllers\AdminAuthController;
use App\Controllers\PagesController;
use App\Controllers\SubjectsController;
use App\Core\OriginCheck;
use App\Core\Response;

require dirname(__DIR__) . '/vendor/autoload.php';

ErrorHandler::register();
$config = new Config(dirname(__DIR__) . '/config/config.php');
$router = new Router();
$health = new HealthController($config);
$auth = new AdminAuthController($config);
$pages = new PagesController($config);
$subjects = new SubjectsController($config);

// Health Check API
$router->add('GET', '/health', [$health, 'status']);
$router->add('GET', '/health/db', [$health, 'db']);
// Login / Logout API
$router->add('POST', '/admin/login', [$auth, 'login']);
$router->add('GET', '/admin/me', [$auth, 'me']);
$router->add('POST', '/admin/logout', [$auth, 'logout']);
// Pages API
$router->add('POST', '/admin/pages', [$pages, 'create']);
$router->add('GET',  '/admin/pages', [$pages, 'list']);
$router->add('GET', '/admin/page', [$pages, 'show']);
$router->add('POST', '/admin/page/update', [$pages, 'update']);
$router->add('POST', '/admin/page/delete', [$pages, 'delete']);
// SUbjects API
$router->add('POST', '/admin/subjects', [$subjects, 'create']);
$router->add('GET', '/admin/subjects', [$subjects, 'list']);
$router->add('GET', '/admin/subject', [$subjects, 'show']);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !(new OriginCheck())->check()) {
    Response::error('Forbidden', 403);
    exit;
}
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
