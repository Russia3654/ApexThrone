<?php
declare(strict_types=1);

use App\Core\Router;
use App\Core\Config;
use App\Core\Response;

require dirname(__DIR__) . '/vendor/autoload.php';

$config = new Config(dirname(__DIR__) . '/config/config.php');
$router = new Router();
$router->add('GET', '/health', fn() => Response::json(['status' => 'ok']));
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
