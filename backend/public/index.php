<?php
declare(strict_types=1);

use App\Core\Router;
use App\Core\Config;
use App\Core\ErrorHandler;
use App\Controllers\HealthController;

require dirname(__DIR__) . '/vendor/autoload.php';

ErrorHandler::register();
$config = new Config(dirname(__DIR__) . '/config/config.php');
$router = new Router();
$health = new HealthController($config);
$router->add('GET', '/health', [$health, 'status']);
$router->add('GET', '/health/db', [$health, 'db']);
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
