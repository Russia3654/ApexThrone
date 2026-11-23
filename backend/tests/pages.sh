#!/usr/bin/env bash
# Checks for GET /api/admin/pages and POST /api/admin/pages (slice 1 of the pages API).
# Run from the project root:
#   ADMIN_PASSWORD='your-dev-password' bash backend/tests/pages.sh [base-url]
# Needs the PHP dev server running, the seed admin, and the pages table (001_content.sql).
# It leaves test rows behind (slugs starting with "test-"). Remove them with:
#   DELETE FROM pages WHERE slug LIKE 'test-%';

BASE="${1:-http://localhost:8000}"
PASS_OK="${ADMIN_PASSWORD:?set ADMIN_PASSWORD to the seed admin password}"
failures=0
body=$(mktemp)
jar=$(mktemp)    # the "browser": holds the session cookie between calls
trap 'rm -f "$body" "$jar"' EXIT

check() {
    if [ "$2" = "1" ]; then echo "PASS - $1"; else echo "FAIL - $1"; failures=$((failures + 1)); fi
}

# call <method> <path> [json] [use-cookie: 1 or 0] : sets $code, fills $body
call() {
    cookies=()
    if [ "${4:-1}" = "1" ]; then cookies=(-b "$jar" -c "$jar"); fi
    if [ -n "$3" ]; then
        code=$(curl -s -o "$body" -w '%{http_code}' "${cookies[@]}" \
            -X "$1" -H 'Content-Type: application/json' --data "$3" "$BASE/api$2")
    else
        code=$(curl -s -o "$body" -w '%{http_code}' "${cookies[@]}" -X "$1" "$BASE/api$2")
    fi
}

# page_json <slug> : a valid page body, fields can be overridden by editing the string below
page_json() {
    echo "{\"menu_name\":\"Test page\",\"slug\":\"$1\",\"position\":1,\"visible\":1,\"status\":\"draft\",\"max_element\":10}"
}

suffix="$(date +%s)$RANDOM"
slug="test-$suffix"

# 1. nothing works without a login
call GET /admin/pages '' 0
check 'list without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"
call POST /admin/pages "$(page_json "$slug")" 0
check 'create without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# 2. log in
call POST /admin/login "{\"username\":\"admin\",\"password\":\"$PASS_OK\"}"
check 'login answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# 3. list
call GET /admin/pages
check 'list answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'list returns a "pages" array' "$(grep -q '"pages":\[' "$body" && echo 1 || echo 0)"

# 4. create a valid page
call POST /admin/pages "$(page_json "$slug")"
check 'create answers 201' "$([ "$code" = 201 ] && echo 1 || echo 0)"
check 'create returns the new slug' "$(grep -q "\"slug\":\"$slug\"" "$body" && echo 1 || echo 0)"
check 'create returns visible as true' "$(grep -q '"visible":true' "$body" && echo 1 || echo 0)"
check 'create returns an id' "$(grep -Eq '"id":[0-9]+' "$body" && echo 1 || echo 0)"
page_id=$(grep -Eo '"id":[0-9]+' "$body" | head -1 | cut -d: -f2)

# 5. the new page shows up in the list
call GET /admin/pages
check 'the new page appears in the list' "$(grep -q "\"slug\":\"$slug\"" "$body" && echo 1 || echo 0)"

# 6. same slug again -> 409
call POST /admin/pages "$(page_json "$slug")"
check 'duplicate slug answers 409' "$([ "$code" = 409 ] && echo 1 || echo 0)"

# 7. visible = 0 must be accepted (it used to be rejected by a logic bug)
call POST /admin/pages "{\"menu_name\":\"Hidden\",\"slug\":\"test-hidden-$suffix\",\"position\":2,\"visible\":0,\"status\":\"draft\",\"max_element\":10}"
check 'visible 0 is accepted' "$([ "$code" = 201 ] && echo 1 || echo 0)"
hidden_id=$(grep -Eo '"id":[0-9]+' "$body" | head -1 | cut -d: -f2)
check 'visible 0 comes back as false' "$(grep -q '"visible":false' "$body" && echo 1 || echo 0)"

# 8. bad input -> 400
call POST /admin/pages 'not json'
check 'invalid JSON answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/pages '{"menu_name":"x"}'
check 'missing fields answer 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/pages "{\"menu_name\":\"x\",\"slug\":\"test-a-$suffix\",\"position\":\"1\",\"visible\":1,\"status\":\"draft\",\"max_element\":10}"
check 'position as a string answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/pages "{\"menu_name\":\"x\",\"slug\":\"test-b-$suffix\",\"position\":1,\"visible\":2,\"status\":\"draft\",\"max_element\":10}"
check 'visible 2 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/pages "{\"menu_name\":\"x\",\"slug\":\"test-c-$suffix\",\"position\":1,\"visible\":1,\"status\":\"hacked\",\"max_element\":10}"
check 'unknown status answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/pages "{\"menu_name\":\"x\",\"slug\":\"Bad Slug\",\"position\":1,\"visible\":1,\"status\":\"draft\",\"max_element\":10}"
check 'slug with a capital and a space answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/pages "{\"menu_name\":\"x\",\"slug\":\"test-d-$suffix\",\"position\":0,\"visible\":1,\"status\":\"draft\",\"max_element\":10}"
check 'position 0 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/pages "{\"menu_name\":\"x\",\"slug\":\"test-e-$suffix\",\"position\":1,\"visible\":1,\"status\":\"draft\",\"max_element\":101}"
check 'max_element 101 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

long=$(printf 'a%.0s' $(seq 1 101))
call POST /admin/pages "{\"menu_name\":\"$long\",\"slug\":\"test-f-$suffix\",\"position\":1,\"visible\":1,\"status\":\"draft\",\"max_element\":10}"
check 'menu_name over 100 characters answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/pages "{\"menu_name\":\"x\",\"slug\":\"$long\",\"position\":1,\"visible\":1,\"status\":\"draft\",\"max_element\":10}"
check 'slug over 100 characters answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

# 9. a failed create must not leave a row behind
call GET /admin/pages
check 'a rejected page was not saved' "$(grep -q 'Bad Slug' "$body" && echo 0 || echo 1)"

# 10. show one page (slice 2)
call GET "/admin/page?id=$page_id" '' 0
check 'show without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

call GET "/admin/page?id=$page_id"
check 'show a real page answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'show returns the right slug' "$(grep -q "\"slug\":\"$slug\"" "$body" && echo 1 || echo 0)"
check 'show returns the same id that create gave' "$(grep -q "\"id\":$page_id" "$body" && echo 1 || echo 0)"

call GET '/admin/page?id=999999999'
check 'show an id that does not exist answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"

call GET '/admin/page?id=abc'
check 'id "abc" answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
check 'a 400 for the id is ONE json answer, not two glued together' "$(grep -q '}{' "$body" && echo 0 || echo 1)"

call GET '/admin/page?id=0'
check 'id 0 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call GET '/admin/page?id=-1'
check 'id -1 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call GET '/admin/page?id=5abc'
check 'id "5abc" answers 400 (not silently cut to 5)' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call GET '/admin/page?id%5B%5D=5'
check 'id as an array answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call GET '/admin/page'
check 'missing id answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST "/admin/page?id=$page_id"
check 'POST on the show route is refused (not 200)' "$([ "$code" != 200 ] && echo 1 || echo 0)"

# 11. update a page (slice 3)
update_json() {   # update_json <slug> <menu_name> <visible> <status>
    echo "{\"menu_name\":\"$2\",\"slug\":\"$1\",\"position\":3,\"visible\":$3,\"status\":\"$4\",\"max_element\":20}"
}

call POST "/admin/page/update?id=$page_id" "$(update_json "$slug" Renamed 0 published)" 0
check 'update without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# keeping the page's OWN slug must be allowed
call POST "/admin/page/update?id=$page_id" "$(update_json "$slug" Renamed 0 published)"
check 'update answers 200 (same slug on the same page is allowed)' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'update returns the new name' "$(grep -q '"menu_name":"Renamed"' "$body" && echo 1 || echo 0)"
check 'update returns the new status' "$(grep -q '"status":"published"' "$body" && echo 1 || echo 0)"
check 'update returns visible as false' "$(grep -q '"visible":false' "$body" && echo 1 || echo 0)"

call GET "/admin/page?id=$page_id"
check 'show returns the saved values' "$(grep -q '"menu_name":"Renamed"' "$body" && grep -q '"max_element":20' "$body" && echo 1 || echo 0)"

# a second page, to test the duplicate slug
slug2="test-two-$suffix"
call POST /admin/pages "$(page_json "$slug2")"
page2_id=$(grep -Eo '"id":[0-9]+' "$body" | head -1 | cut -d: -f2)

call POST "/admin/page/update?id=$page_id" "$(update_json "$slug2" Renamed 0 published)"
check 'taking another page'"'"'s slug answers 409' "$([ "$code" = 409 ] && echo 1 || echo 0)"
call GET "/admin/page?id=$page_id"
check 'a refused update changed nothing' "$(grep -q "\"slug\":\"$slug\"" "$body" && echo 1 || echo 0)"

call POST '/admin/page/update?id=999999999' "$(update_json "test-x-$suffix" Renamed 0 published)"
check 'update an id that does not exist answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"

call POST '/admin/page/update?id=abc' "$(update_json "test-y-$suffix" Renamed 0 published)"
check 'update with id "abc" answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST '/admin/page/update' "$(update_json "test-z-$suffix" Renamed 0 published)"
check 'update with no id answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST "/admin/page/update?id=$page_id" 'not json'
check 'update with invalid JSON answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST "/admin/page/update?id=$page_id" '{"menu_name":"x"}'
check 'update with missing fields answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST "/admin/page/update?id=$page_id" "$(update_json "$slug" Renamed 5 published)"
check 'update with visible 5 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

# validation runs BEFORE the existence check: bad data on a missing page is still a 400
call POST '/admin/page/update?id=999999999' '{"menu_name":"x"}'
check 'bad data on a missing page answers 400, not 404' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call GET "/admin/page/update?id=$page_id"
check 'GET on the update route is refused (not 200)' "$([ "$code" != 200 ] && echo 1 || echo 0)"

# 12. delete a page (slice 4); this also cleans up the pages the script created
call POST "/admin/page/delete?id=$page_id" '' 0
check 'delete without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"
call GET "/admin/page?id=$page_id"
check 'a delete without a login removed nothing' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# a GET must never delete (course rule: never change data on a GET)
call GET "/admin/page/delete?id=$page_id"
check 'GET on the delete route is refused (not 200)' "$([ "$code" != 200 ] && echo 1 || echo 0)"
call GET "/admin/page?id=$page_id"
check 'a GET on the delete route removed nothing' "$([ "$code" = 200 ] && echo 1 || echo 0)"

call POST '/admin/page/delete?id=abc'
check 'delete with id "abc" answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call POST '/admin/page/delete'
check 'delete with no id answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call POST '/admin/page/delete?id=999999999'
check 'delete an id that does not exist answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"

call POST "/admin/page/delete?id=$page_id"
check 'delete a real page answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'delete answers {"ok":true}' "$(grep -q '"ok":true' "$body" && echo 1 || echo 0)"

call GET "/admin/page?id=$page_id"
check 'show after delete answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"
call GET /admin/pages
check 'the deleted page is gone from the list' "$(grep -q "\"slug\":\"$slug\"" "$body" && echo 0 || echo 1)"
check 'the other test page is still in the list' "$(grep -q "\"slug\":\"$slug2\"" "$body" && echo 1 || echo 0)"

call POST "/admin/page/delete?id=$page_id"
check 'deleting the same page twice answers 404 the second time' "$([ "$code" = 404 ] && echo 1 || echo 0)"

# cleanup: remove the other pages this run created
call POST "/admin/page/delete?id=$page2_id"
check 'cleanup: second test page deleted' "$([ "$code" = 200 ] && echo 1 || echo 0)"
call POST "/admin/page/delete?id=$hidden_id"
check 'cleanup: hidden test page deleted' "$([ "$code" = 200 ] && echo 1 || echo 0)"

echo
echo 'Cleanup (phpMyAdmin): DELETE FROM pages WHERE slug LIKE '"'"'test-%'"'"';'
if [ "$failures" -eq 0 ]; then echo 'ALL CHECKS PASSED'; exit 0; fi
echo "$failures CHECK(S) FAILED"; exit 1
