<?php
declare(strict_types=1);

namespace App\Core;

use RuntimeException;

final class Config
{
    private array $data = [];

    public function __construct(private string $path)
    {
        if (!is_file($this->path)) {
            throw new RuntimeException("Config file not found: {$this->path}");
        }

        $loaded = require $this->path;
        if (!is_array($loaded)) {
            throw new RuntimeException("Config file must return an array: {$this->path}");
        }

        $this->data = $loaded;
    }

    public function get(string $key): mixed
    {
        $segments = explode('.', $key);
        $current = $this->data;
        foreach ($segments as $segment) {
            if (!is_array($current) || !array_key_exists($segment, $current)) {
                throw new RuntimeException("Config key not found: {$key}");
            }
            $current = $current[$segment];
        }
        return $current;
    }
}
