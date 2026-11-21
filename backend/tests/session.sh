#!/usr/bin/env bash
# Checks for GET /api/admin/me and POST /api/admin/logout (the session life cycle).
# Run from the project root:
#   ADMIN_PASSWORD='your-dev-password' bash backend/tests/session.sh [base-url]
# Needs the PHP dev server running and the seed admin ("admin") in the database.

BASE="${1:-http://localhost:8000}"
PASS_OK="${ADMIN_PASSWORD:?set ADMIN_PASSWORD to the seed admin password}"
failures=0
body=$(mktemp)
jar=$(mktemp)    # the "browser": holds the session cookie between calls
trap 'rm -f "$body" "$jar"' EXIT

check() {
    if [ "$2" = "1" ]; then echo "PASS - $1"; else echo "FAIL - $1"; failures=$((failures + 1)); fi
}

# call <method> <path> [json] : uses the cookie jar, sets $code, fills $body
call() {
    if [ -n "$3" ]; then
        code=$(curl -s -o "$body" -w '%{http_code}' -b "$jar" -c "$jar" \
            -X "$1" -H 'Content-Type: application/json' --data "$3" "$BASE/api$2")
    else
        code=$(curl -s -o "$body" -w '%{http_code}' -b "$jar" -c "$jar" -X "$1" "$BASE/api$2")
    fi
}

# 1. not logged in yet
call GET /admin/me
check 'me without login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# 2. log in, then the cookie jar holds the session
call POST /admin/login "{\"username\":\"admin\",\"password\":\"$PASS_OK\"}"
check 'login answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

call GET /admin/me
check 'me after login answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'me returns the username' "$(grep -q '"username":"admin"' "$body" && echo 1 || echo 0)"
check 'me never returns the password or hash' "$(grep -qi 'password' "$body" && echo 0 || echo 1)"

# 3. a request with no cookie must still be refused (the jar is the only login)
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/admin/me")
check 'me without the cookie answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# 4. logout, then the old cookie must no longer work
cp "$jar" "$jar.old"
call POST /admin/logout
check 'logout answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

call GET /admin/me
check 'me after logout answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# 5. replay the OLD cookie: proves the session file is really destroyed on the server
code=$(curl -s -o /dev/null -w '%{http_code}' -b "$jar.old" "$BASE/api/admin/me")
check 'the old session cookie is dead after logout' "$([ "$code" = 401 ] && echo 1 || echo 0)"
rm -f "$jar.old"

# 6. logout when not logged in is harmless
call POST /admin/logout
check 'logout when not logged in answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# 7. logout must not accept GET
call GET /admin/logout
check 'GET on logout is refused (not 200)' "$([ "$code" != 200 ] && echo 1 || echo 0)"

echo
if [ "$failures" -eq 0 ]; then echo 'ALL CHECKS PASSED'; exit 0; fi
echo "$failures CHECK(S) FAILED"; exit 1
