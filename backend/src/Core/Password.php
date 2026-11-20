<?php

declare(strict_types=1);

namespace App\Core;

final class Password
{
    private string $algo;
    private string $environment;

    public function __construct(Config $config)
    {
        $this->environment = (string) $config->get('env');
        $this->algo = (string) $config->get('app.password_algo');
        if ($this->environment === 'production' && $this->algo === 'md5') {
            throw new \RuntimeException('md5 is not allowed in production');
        }
        if ($this->algo !== 'bcrypt' && $this->algo !== 'md5') {
            throw new \RuntimeException('unknown password algorithm');
        }
    }
    public function hash(string $plain): string
    {
        if ($this->algo === 'bcrypt') {
            return password_hash($plain, PASSWORD_BCRYPT);
        } else {
            return md5($plain);
        }
    }

    public function verify(string $plain, string $stored): bool
    {
        if ($this->algo === 'bcrypt') {
            return password_verify($plain, $stored);
        } else {
            return hash_equals(md5($plain), $stored);
        }
    }
}
