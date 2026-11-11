#!/usr/bin/env bash
# Smoke test for the ApexThrone API.
# Usage: bash backend/tests/smoke.sh [base-url]
# Default base URL: http://127.0.0.1:8000

base="${1:-http://127.0.0.1:8000}"
failures=0

check() {
  if [ "$2" = "yes" ]; then
    echo "PASS - $1"
  else
    echo "FAIL - $1"
    failures=$((failures + 1))
  fi
}

status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
ctype()  { curl -s -o /dev/null -w '%{content_type}' "$@"; }
body()   { curl -s "$@"; }

expect_status() {
  local name="$1" expected="$2"
  shift 2
  [ "$(status "$@")" = "$expected" ] && check "$name" yes || check "$name" no
}

expect_json() {
  local name="$1"
  shift
  ctype "$@" | grep -q 'application/json' && check "$name" yes || check "$name" no
}

expect_body_has() {
  local name="$1" needle="$2"
  shift 2
  body "$@" | grep -qF -- "$needle" && check "$name" yes || check "$name" no
}

expect_body_lacks() {
  local name="$1" needle="$2"
  shift 2
  body "$@" | grep -qF -- "$needle" && check "$name" no || check "$name" yes
}

expect_status     "GET /api/health is 200"                200 "$base/api/health"
expect_json       "GET /api/health is JSON"                   "$base/api/health"
expect_body_has   "health body says ok"           '"status":"ok"' "$base/api/health"
expect_body_has   "health body has a time"        '"time":"'      "$base/api/health"
expect_status     "trailing slash is ignored"             200 "$base/api/health/"
expect_status     "GET /api/health/db is 200"             200 "$base/api/health/db"
expect_json       "GET /api/health/db is JSON"                "$base/api/health/db"
expect_body_has   "health/db body says ok"        '{"db":"ok"}'   "$base/api/health/db"
expect_status     "unknown route is 404"                  404 "$base/api/nothing"
expect_json       "the 404 answer is JSON"                    "$base/api/nothing"
expect_body_has   "the 404 body has an error key" '"error"'       "$base/api/nothing"
expect_status     "wrong method is 404"                   404 -X POST "$base/api/health"
expect_status     "no /api prefix is 404"                 404 "$base/health"
expect_status     "/api/index.php is 404"                 404 "$base/api/index.php"
expect_status     "/index.php is 404"                     404 "$base/index.php"
expect_status     "/.env is 404"                          404 "$base/.env"
expect_status     "path traversal is 404"                 404 --path-as-is "$base/api/../config/config.php"
expect_body_lacks "traversal shows no PHP code"   '<?php'         --path-as-is "$base/api/../config/config.php"
expect_body_lacks "404 body shows no file name"   '.php'          "$base/api/nothing"

echo
if [ "$failures" -eq 0 ]; then
  echo "ALL CHECKS PASSED"
else
  echo "$failures CHECK(S) FAILED"
  exit 1
fi