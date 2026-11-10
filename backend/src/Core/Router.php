<?php

declare(strict_types=1);

namespace App\Core;

final class Router
{
    private array $routes = [];
    private string $prefix;

    private function notFound(): void
    {
        Response::error('Not found', 404);
    }

    public function __construct(string $prefix = '/api')
    {
        $this->prefix = $prefix;
    }

    public function add(string $method, string $path, callable $handler): void
    {
        $this->routes[strtoupper($method)][$path] = $handler;
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH);
        if (!is_string($path)) {
            $this->notFound();
            return;
        }
        if ($path === $this->prefix || !str_starts_with($path, $this->prefix . '/')) {
            $this->notFound();
            return;
        }
        $path = substr($path, strlen($this->prefix));
        $path = '/' . rtrim($path, '/');
        $handler = $this->routes[strtoupper($method)][$path] ?? null;
        if ($handler === null) {
            $this->notFound();
            return;
        }
        $handler();
    }
}
