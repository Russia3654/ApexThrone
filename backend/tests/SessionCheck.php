<?php

// Checks for App\Core\Session.
// Run from the project root: php backend/tests/SessionCheck.php
// Needs backend/vendor/autoload.php (run "composer install" in backend/ once).

declare(strict_types=1);

// Buffer all output, so PHP does not count the test's own echo as "headers already sent".
ob_start();

require dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Config;
use App\Core\Session;

$failures = 0;
$tempFiles = [];

// The CLI user may not be allowed to write PHP's default session folder.
session_save_path(sys_get_temp_dir());

function check(string $name, bool $ok): void
{
    global $failures;
    echo ($ok ? 'PASS' : 'FAIL') . ' - ' . $name . PHP_EOL;
    if (!$ok) {
        $failures++;
    }
}

// Builds a Config from a throwaway file with the given cookie_secure value.
function makeConfig(mixed $cookieSecure): Config
{
    global $tempFiles;
    $path = tempnam(sys_get_temp_dir(), 'cfg');
    $tempFiles[] = $path;
    file_put_contents($path, '<?php return ' . var_export([
        'app' => ['cookie_secure' => $cookieSecure],
    ], true) . ';');
    return new Config($path);
}

// Starts a session with the given setting, returns the cookie parameters PHP ended up with.
function cookieParamsFor(mixed $cookieSecure): array
{
    (new Session())->start(makeConfig($cookieSecure));
    $params = session_get_cookie_params();
    session_write_close();
    return $params;
}

// true=secure, false=not secure
check('cookie_secure true gives a Secure cookie', cookieParamsFor(true)['secure'] === true);
check('cookie_secure false gives a non-Secure cookie', cookieParamsFor(false)['secure'] === false);

// auto: depends on the request itself
unset($_SERVER['HTTPS'], $_SERVER['HTTP_X_FORWARDED_PROTO']);
check('auto + plain HTTP gives a non-Secure cookie', cookieParamsFor('auto')['secure'] === false);

$_SERVER['HTTPS'] = 'on';
check('auto + HTTPS on gives a Secure cookie', cookieParamsFor('auto')['secure'] === true);

unset($_SERVER['HTTPS']);
$_SERVER['HTTP_X_FORWARDED_PROTO'] = 'https';
check('auto ignores X-Forwarded-Proto', cookieParamsFor('auto')['secure'] === false);
unset($_SERVER['HTTP_X_FORWARDED_PROTO']);

// fixed protections
$params = cookieParamsFor(false);
check('cookie is HttpOnly', $params['httponly'] === true);
check('cookie is SameSite=Lax', $params['samesite'] === 'Lax');
check('cookie path is / and lasts until the browser closes', $params['path'] === '/' && $params['lifetime'] === 0);
check('strict mode is on', ini_get('session.use_strict_mode') === '1');

// bad setting
try {
    cookieParamsFor('yes');
    check('an unknown cookie_secure value is refused', false);
} catch (RuntimeException $e) {
    check('an unknown cookie_secure value is refused', true);
}

// calling start twice is harmless
try {
    $session = new Session();
    $config = makeConfig(false);
    $session->start($config);
    $session->start($config);
    session_write_close();
    check('calling start() twice does not fail', true);
} catch (Throwable $e) {
    check('calling start() twice does not fail', false);
}

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
