<?php

declare(strict_types=1);

use App\Core\Router;
use App\Core\Config;
use App\Core\ErrorHandler;
use App\Controllers\HealthController;
use App\Controllers\AdminAuthController;
use App\Controllers\PagesController;

require dirname(__DIR__) . '/vendor/autoload.php';

ErrorHandler::register();
$config = new Config(dirname(__DIR__) . '/config/config.php');
$router = new Router();
$health = new HealthController($config);
$auth = new AdminAuthController($config);
$pages = new PagesController($config);
$router->add('GET', '/health', [$health, 'status']);
$router->add('GET', '/health/db', [$health, 'db']);
$router->add('POST', '/admin/login', [$auth, 'login']);
$router->add('GET', '/admin/me', [$auth, 'me']);
$router->add('POST', '/admin/logout', [$auth, 'logout']);
$router->add('GET',  '/admin/pages', [$pages, 'list']);
$router->add('POST', '/admin/pages', [$pages, 'create']);
$router->add('GET', '/admin/page', [$pages, 'show']);
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
