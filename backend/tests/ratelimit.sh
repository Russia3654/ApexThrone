#!/usr/bin/env bash
# Checks for the login rate limit (5 failed tries in 15 minutes -> 429).
# Run from the project root:
#   ADMIN_PASSWORD='your-dev-password' bash backend/tests/ratelimit.sh [base-url]
# Needs the PHP dev server running, the seed admin, and the login_attempts table (002_admins.sql).
# It uses throwaway usernames starting with "rl-" so the real admin is never locked out.
# Leftover rows are harmless (they expire after 15 minutes). To remove them:
#   DELETE FROM login_attempts WHERE identifier LIKE 'rl-%';

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

# post <json> : sets $code, fills $body and $headers
post() {
    code=$(curl -s -o "$body" -D "$headers" -w '%{http_code}' \
        -X POST -H 'Content-Type: application/json' --data "$1" "$URL")
}

suffix="$(date +%s)$RANDOM"
fake="rl-$suffix"          # a username that does not exist
fake2="rl-two-$suffix"     # a second one, to prove the counter is per username

# 1. five wrong tries on an unknown username: each one is a normal 401
all401=1
for i in 1 2 3 4 5; do
    post "{\"username\":\"$fake\",\"password\":\"wrong-$i\"}"
    if [ "$code" != 401 ]; then all401=0; fi
done
check 'the first 5 wrong tries each answer 401' "$all401"

# 2. the sixth is blocked, even though the user does not exist
post "{\"username\":\"$fake\",\"password\":\"wrong-6\"}"
check 'the 6th try answers 429 (unknown usernames are counted too)' "$([ "$code" = 429 ] && echo 1 || echo 0)"
check '429 carries a Retry-After header' "$(grep -qi '^retry-after:' "$headers" && echo 1 || echo 0)"
check '429 sets no session cookie' "$(grep -qi '^set-cookie:' "$headers" && echo 0 || echo 1)"

# 3. it stays blocked
post "{\"username\":\"$fake\",\"password\":\"wrong-7\"}"
check 'the 7th try is still 429' "$([ "$code" = 429 ] && echo 1 || echo 0)"

# 4. the counter belongs to the username, not to everybody
post "{\"username\":\"$fake2\",\"password\":\"wrong\"}"
check 'a different username is not blocked' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# 5. bad input is refused before it is counted (a 400 must not use up an attempt)
for i in 1 2 3 4 5 6; do
    post "{\"username\":\"$fake2\",\"password\":\"\"}"
done
post "{\"username\":\"$fake2\",\"password\":\"wrong\"}"
check 'invalid input (400) does not count as a failed try' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# 6. a good login resets the counter (uses the real admin, but never reaches 5 failures)
post "{\"username\":\"admin\",\"password\":\"$PASS_OK\"}"
check 'good login answers 200 (clears old failures)' "$([ "$code" = 200 ] && echo 1 || echo 0)"

for i in 1 2 3 4; do
    post '{"username":"admin","password":"definitely-wrong"}'
    [ "$code" = 401 ] || break
done
check '4 wrong tries on the real admin are all 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

post "{\"username\":\"admin\",\"password\":\"$PASS_OK\"}"
check 'a good login with 4 failures behind it still works (under the limit)' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# after the reset, 4 more wrong tries must again be 401. Without the reset, the second one would already be 429.
all401=1
for i in 1 2 3 4; do
    post '{"username":"admin","password":"definitely-wrong"}'
    if [ "$code" != 401 ]; then all401=0; fi
done
check 'a good login resets the counter (4 more wrong tries are all 401)' "$all401"

# leave the admin clean for the other test scripts
post "{\"username\":\"admin\",\"password\":\"$PASS_OK\"}"
check 'cleanup: final good login answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

echo
echo 'Cleanup (phpMyAdmin, optional): DELETE FROM login_attempts WHERE identifier LIKE '"'"'rl-%'"'"';'
if [ "$failures" -eq 0 ]; then echo 'ALL CHECKS PASSED'; exit 0; fi
echo "$failures CHECK(S) FAILED"; exit 1
