#!/usr/bin/env bash
# Checks for POST /api/admin/login.
# Run from the project root:
#   ADMIN_PASSWORD='your-dev-password' bash backend/tests/login.sh [base-url]
# Needs the PHP dev server running and the seed admin ("admin") in the database.

BASE="${1:-http://localhost:8000}"
PASS_OK="${ADMIN_PASSWORD:?set ADMIN_PASSWORD to the seed admin password}"
URL="$BASE/api/admin/login"
failures=0
body=$(mktemp)
headers=$(mktemp)
trap 'rm -f "$body" "$headers"' EXIT

check() {
    if [ "$2" = "1" ]; then echo "PASS - $1"; else echo "FAIL - $1"; failures=$((failures + 1)); fi
}

# post <json> : sends the JSON, sets $code to the HTTP status, fills $body and $headers
post() {
    code=$(curl -s -o "$body" -D "$headers" -w '%{http_code}' \
        -X POST -H 'Content-Type: application/json' --data "$1" "$URL")
}

post "{\"username\":\"admin\",\"password\":\"$PASS_OK\"}"
check 'good login answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'good login returns the username' "$(grep -q '"username":"admin"' "$body" && echo 1 || echo 0)"
check 'good login never returns the password or hash' "$(grep -qi 'password' "$body" && echo 0 || echo 1)"
check 'good login sets an HttpOnly cookie' "$(grep -i '^set-cookie:' "$headers" | grep -qi 'httponly' && echo 1 || echo 0)"
check 'good login cookie is SameSite=Lax' "$(grep -i '^set-cookie:' "$headers" | grep -qi 'samesite=lax' && echo 1 || echo 0)"

post '{"username":"admin","password":"definitely-wrong"}'
check 'wrong password answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"
wrong_body=$(cat "$body")

post '{"username":"nobody-here","password":"whatever"}'
check 'unknown user answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"
check 'unknown user and wrong password give the same answer' "$([ "$(cat "$body")" = "$wrong_body" ] && echo 1 || echo 0)"
check 'failed login sets no session cookie' "$(grep -qi '^set-cookie:' "$headers" && echo 0 || echo 1)"

post 'this is not json'
check 'invalid JSON answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

post '"just a string"'
check 'JSON that is not an object answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

post '{"username":"admin"}'
check 'missing password answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

post '{"password":"x"}'
check 'missing username answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

post '{"username":"","password":""}'
check 'empty fields answer 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

post '{"username":["admin"],"password":"x"}'
check 'username that is not a string answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

long=$(printf 'a%.0s' $(seq 1 51))
post "{\"username\":\"$long\",\"password\":\"x\"}"
check 'username over 50 characters answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

post "{\"username\":\"admin' OR '1'='1\",\"password\":\"x\"}"
check 'SQL injection in username answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

code=$(curl -s -o /dev/null -w '%{http_code}' "$URL")
check 'GET on the login route is refused (not 200)' "$([ "$code" != 200 ] && echo 1 || echo 0)"

echo
if [ "$failures" -eq 0 ]; then echo 'ALL CHECKS PASSED'; exit 0; fi
echo "$failures CHECK(S) FAILED"; exit 1
