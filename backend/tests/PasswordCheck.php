<?php

// Checks for App\Core\Password.
// Run from the project root: php backend/tests/PasswordCheck.php
// Needs backend/vendor/autoload.php (run "composer install" in backend/ once).

declare(strict_types=1);

require dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Config;
use App\Core\Password;

$failures = 0;
$tempFiles = [];

function check(string $name, bool $ok): void
{
    global $failures;
    echo ($ok ? 'PASS' : 'FAIL') . ' - ' . $name . PHP_EOL;
    if (!$ok) {
        $failures++;
    }
}

// Builds a Password helper from a throwaway config file.
function makePassword(string $env, string $algo): Password
{
    global $tempFiles;
    $path = tempnam(sys_get_temp_dir(), 'cfg');
    $tempFiles[] = $path;
    file_put_contents($path, '<?php return ' . var_export([
        'env' => $env,
        'app' => ['password_algo' => $algo],
    ], true) . ';');
    return new Password(new Config($path));
}

// True when building the helper throws a RuntimeException.
function refuses(string $env, string $algo): bool
{
    try {
        makePassword($env, $algo);
        return false;
    } catch (RuntimeException $e) {
        return true;
    }
}

// bcrypt
$bcrypt = makePassword('development', 'bcrypt');
$hash = $bcrypt->hash('secret-pass');
check('bcrypt: hash is a 60-character bcrypt string', strlen($hash) === 60 && str_starts_with($hash, '$2y$'));
check('bcrypt: hash does not contain the plain password', !str_contains($hash, 'secret-pass'));
check('bcrypt: the right password verifies', $bcrypt->verify('secret-pass', $hash));
check('bcrypt: a wrong password fails', !$bcrypt->verify('wrong-pass', $hash));
check('bcrypt: hashing twice gives two different strings (random salt)', $bcrypt->hash('secret-pass') !== $hash);
check('bcrypt: allowed in production', !refuses('production', 'bcrypt'));

// md5 (development only)
$md5 = makePassword('development', 'md5');
$md5Hash = $md5->hash('secret-pass');
check('md5: hash is the plain md5 of the password', $md5Hash === md5('secret-pass'));
check('md5: the right password verifies', $md5->verify('secret-pass', $md5Hash));
check('md5: a wrong password fails', !$md5->verify('wrong-pass', $md5Hash));
check('md5: refused in production', refuses('production', 'md5'));

// unknown algorithm
check('unknown algorithm is refused', refuses('development', 'sha1'));
check('empty algorithm is refused', refuses('development', ''));

foreach ($tempFiles as $file) {
    unlink($file);
}

echo PHP_EOL;
if ($failures === 0) {
    echo 'ALL CHECKS PASSED' . PHP_EOL;
    exit(0);
}
echo $failures . ' CHECK(S) FAILED' . PHP_EOL;
exit(1);
