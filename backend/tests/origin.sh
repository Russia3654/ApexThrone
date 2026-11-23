#!/usr/bin/env bash
# Checks for the Origin check (cross-site POST protection).
# Run from the project root:
#   ADMIN_PASSWORD='your-dev-password' bash backend/tests/origin.sh [base-url]
# Needs the PHP dev server running and the seed admin ("admin") in the database.
# The "Origin" the browser would send for a page on this same server is built from the base URL.

BASE="${1:-http://localhost:8000}"
PASS_OK="${ADMIN_PASSWORD:?set ADMIN_PASSWORD to the seed admin password}"
SAME_ORIGIN="$BASE"            # e.g. http://localhost:8000 : what a same-site page would send
failures=0
body=$(mktemp)
jar=$(mktemp)
trap 'rm -f "$body" "$jar"' EXIT

check() {
    if [ "$2" = "1" ]; then echo "PASS - $1"; else echo "FAIL - $1"; failures=$((failures + 1)); fi
}

# send <method> <path> <origin or -> [json] : "-" means send no Origin header at all
send() {
    origin_args=()
    if [ "$3" != "-" ]; then origin_args=(-H "Origin: $3"); fi
    data_args=()
    if [ -n "$4" ]; then data_args=(-H 'Content-Type: application/json' --data "$4"); fi
    code=$(curl -s -o "$body" -w '%{http_code}' -b "$jar" -c "$jar" \
        -X "$1" "${origin_args[@]}" "${data_args[@]}" "$BASE/api$2")
}

login_json="{\"username\":\"admin\",\"password\":\"$PASS_OK\"}"

# 1. a POST from another site is refused, before the route runs
send POST /admin/login 'http://evil.example' "$login_json"
check 'login from http://evil.example answers 403' "$([ "$code" = 403 ] && echo 1 || echo 0)"
check 'the 403 is a JSON error' "$(grep -q '"error"' "$body" && echo 1 || echo 0)"

# 2. the same applies to every POST, even with a wrong-looking body (the check runs first)
send POST /admin/logout 'http://evil.example'
check 'logout from another site answers 403' "$([ "$code" = 403 ] && echo 1 || echo 0)"
send POST /admin/pages 'http://evil.example' '{"menu_name":"x"}'
check 'create page from another site answers 403 (not 401 or 400)' "$([ "$code" = 403 ] && echo 1 || echo 0)"

# 3. look-alike hosts must not pass
send POST /admin/logout "http://localhost.evil.example"
check 'a look-alike host answers 403' "$([ "$code" = 403 ] && echo 1 || echo 0)"
send POST /admin/logout 'http://localhost:9999'
check 'same host on a different port answers 403' "$([ "$code" = 403 ] && echo 1 || echo 0)"

# 4. unreadable origins are refused
send POST /admin/logout 'null'
check 'Origin "null" answers 403' "$([ "$code" = 403 ] && echo 1 || echo 0)"
send POST /admin/logout 'not a url'
check 'a garbage Origin answers 403' "$([ "$code" = 403 ] && echo 1 || echo 0)"

# 5. the real site still works
send POST /admin/login "$SAME_ORIGIN" "$login_json"
check 'login from the same origin answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
send GET /admin/me "$SAME_ORIGIN"
check 'me with the session cookie answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# uppercase host letters are still the same host
upper=$(echo "$SAME_ORIGIN" | sed 's#//localhost#//LOCALHOST#')
send POST /admin/logout "$upper"
check 'an upper-case host in the Origin is accepted' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# 6. no Origin header at all (curl, scripts): allowed, the other test scripts rely on it
send POST /admin/login '-' "$login_json"
check 'login with no Origin header answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# 7. reads are never blocked: a GET changes nothing
send GET /admin/me 'http://evil.example'
check 'a GET with a foreign Origin is not blocked by the check' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# 8. the refused request really did nothing: still logged in after the evil logout
send POST /admin/logout 'http://evil.example'
send GET /admin/me '-'
check 'a refused logout did not log the admin out' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# leave the session clean
send POST /admin/logout '-'

echo
if [ "$failures" -eq 0 ]; then echo 'ALL CHECKS PASSED'; exit 0; fi
echo "$failures CHECK(S) FAILED"; exit 1
