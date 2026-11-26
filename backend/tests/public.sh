#!/usr/bin/env bash
# Checks for the public API: GET /api/menu and GET /api/page?slug=
# Run from the project root:
#   ADMIN_PASSWORD='your-dev-password' bash backend/tests/public.sh [base-url]
# Against srv01 add CALL_DELAY=0.3 (nginx there limits the request rate).
# Needs migrations 001 and 003 and the core pages from seed.sql ("about" visible and published).
# The admin password is only used to prepare data: every public request is sent without a cookie.
# It creates test subpages (slugs starting with "test-pub-") under "about" and deletes them at the end.
# It also hides and moves "about" for a moment; it is restored even if the script stops early.
# If test rows are left over, remove them with:
#   DELETE FROM pages WHERE slug LIKE 'test-pub-%';

BASE="${1:-http://localhost:8000}"
PASS_OK="${ADMIN_PASSWORD:?set ADMIN_PASSWORD to the seed admin password}"
failures=0
body=$(mktemp)
jar=$(mktemp)    # the admin's "browser": holds the session cookie
about_restore=''

check() {
    if [ "$2" = "1" ]; then echo "PASS - $1"; else echo "FAIL - $1"; failures=$((failures + 1)); fi
}

# call <method> <path> [json] [use-cookie: 1 or 0] : sets $code, fills $body
call() {
    sleep "${CALL_DELAY:-0}"
    cookies=()
    if [ "${4:-1}" = "1" ]; then cookies=(-b "$jar" -c "$jar"); fi
    if [ -n "$3" ]; then
        code=$(curl -s -o "$body" -w '%{http_code}' "${cookies[@]}" \
            -X "$1" -H 'Content-Type: application/json' --data "$3" "$BASE/api$2")
    else
        code=$(curl -s -o "$body" -w '%{http_code}' "${cookies[@]}" -X "$1" "$BASE/api$2")
    fi
}

# whatever happens, put "about" back and remove the temporary files
finish() {
    if [ -n "$about_restore" ]; then call POST "/admin/page/update?id=$about_id" "$about_restore"; fi
    rm -f "$body" "$jar"
}
trap finish EXIT

# visit <path> : what an anonymous visitor does
visit() { call GET "$1" '' 0; }

# status_is <code> : 1 if the last answer had that status
status_is() { [ "$code" = "$1" ] && echo 1 || echo 0; }

# has <text> : 1 if the last answer contains the text
has() { grep -qF -- "$1" "$body" && echo 1 || echo 0; }

# lacks <text> : 1 only if the answer is a 200 AND does not contain the text
# (an error answer also "does not contain" it, so the status has to be part of the check)
lacks() { [ "$code" = 200 ] && ! grep -qF -- "$1" "$body" && echo 1 || echo 0; }

# make_page <slug> <menu_name> <position> <visible> <status> : a subpage of "about", sets $new_id
make_page() {
    call POST /admin/pages "{\"parent_ID\":$about_id,\"menu_name\":\"$2\",\"slug\":\"$1\",\"position\":$3,\"visible\":$4,\"status\":\"$5\",\"max_element\":10}"
    new_id=$(grep -Eo '"id":[0-9]+' "$body" | head -1 | cut -d: -f2)
    if [ "$code" != 201 ]; then setup_ok=0; fi
}

# make_subject <page id> <menu_name> <position> <visible> <status>
make_subject() {
    call POST /admin/subjects "{\"page_ID\":$1,\"menu_name\":\"$2\",\"position\":$3,\"visible\":$4,\"content\":\"Content of $2\",\"status\":\"$5\"}"
    if [ "$code" != 201 ]; then setup_ok=0; fi
}

# set_about <sed expression> : update "about" with one field changed from its original value
set_about() {
    call POST "/admin/page/update?id=$about_id" "$(echo "$about_restore" | sed -E "$1")"
}

suffix="$(date +%s)$RANDOM"
slug_a="test-pub-a-$suffix"         # visible + published, position 2
slug_b="test-pub-b-$suffix"         # visible + published, position 1, no subjects
slug_h="test-pub-hidden-$suffix"    # published but NOT visible
slug_d="test-pub-draft-$suffix"     # visible but draft
slug_r="test-pub-archived-$suffix"  # visible but archived

# ---- setup (as the admin)
call POST /admin/login "{\"username\":\"admin\",\"password\":\"$PASS_OK\"}"
check 'setup: login answers 200' "$(status_is 200)"

call GET /admin/pages
about=$(grep -Eo '\{[^{}]*"slug":"about"[^{}]*\}' "$body" | sed 's/"visible":true/"visible":1/; s/"visible":false/"visible":0/')
about_id=$(echo "$about" | grep -Eo '"id":[0-9]+' | cut -d: -f2)
if [ -z "$about_id" ]; then echo 'FAIL - setup: the core page "about" was not found, stopping'; exit 1; fi
about_restore=$about
check 'setup: "about" is visible and published' "$(echo "$about" | grep -q '"visible":1' && echo "$about" | grep -q '"status":"published"' && echo 1 || echo 0)"

setup_ok=1
make_page "$slug_a" 'Pub A' 2 1 published;        page_a=$new_id
make_page "$slug_b" 'Pub B' 1 1 published;        page_b=$new_id
make_page "$slug_h" 'Pub Hidden' 1 0 published;   page_h=$new_id
make_page "$slug_d" 'Pub Draft' 1 1 draft;        page_d=$new_id
make_page "$slug_r" 'Pub Archived' 1 1 archived;  page_r=$new_id
check 'setup: the 5 test subpages are created' "$setup_ok"

setup_ok=1
make_subject "$page_a" 'Shown second' 2 1 published
make_subject "$page_a" 'Shown first' 1 1 published
make_subject "$page_a" 'Secret hidden' 1 0 published
make_subject "$page_a" 'Secret draft' 1 1 draft
make_subject "$page_a" 'Secret archived' 1 1 archived
make_subject "$page_h" 'Secret on hidden page' 1 1 published
check 'setup: the 6 test subjects are created' "$setup_ok"

# ---- 1. the menu: core pages only
visit /menu
check 'menu answers 200 without a login' "$(status_is 200)"
check 'menu returns a "menu" array' "$(has '"menu":[')"
check 'menu lists the core page "about"' "$(has '"slug":"about"')"
check 'menu lists no subpage' "$(lacks 'test-pub-')"
leaks=0
for key in id ID parent_ID status visible position max_element created_at updated_at; do
    if grep -qF "\"$key\":" "$body"; then leaks=1; fi
done
check 'menu exposes only menu_name and slug' "$([ "$code" = 200 ] && [ "$leaks" = 0 ] && echo 1 || echo 0)"
set_about 's/"position":[0-9]+/"position":1000/'
visit /menu
last=$(grep -Eo '"slug":"[a-z0-9-]+"' "$body" | tail -1)
check 'menu is ordered by position (about moved to the end)' "$([ "$last" = '"slug":"about"' ] && echo 1 || echo 0)"
set_about ''

# ---- 2. a core page lists its subpages
visit '/page?slug=about'
check 'a core page answers 200 without a login' "$(status_is 200)"
check 'it lists its published subpages' "$([ "$(has "$slug_a")" = 1 ] && [ "$(has "$slug_b")" = 1 ] && echo 1 || echo 0)"
check 'the hidden subpage is not listed' "$(lacks "$slug_h")"
check 'the draft subpage is not listed' "$(lacks "$slug_d")"
check 'the archived subpage is not listed' "$(lacks "$slug_r")"
subpages=$(grep -Eo '"subpages":\[[^]]*\]' "$body")
first=$(echo "$subpages" | grep -Eo "test-pub-[ab]-$suffix" | head -1)
check 'subpages are ordered by position (B before A)' "$([ "$first" = "$slug_b" ] && echo 1 || echo 0)"
leaks=0
for key in id ID parent_ID status visible position max_element created_at updated_at; do
    if echo "$subpages" | grep -qF "\"$key\":"; then leaks=1; fi
done
check 'a listed subpage exposes only menu_name and slug' "$([ -n "$subpages" ] && [ "$leaks" = 0 ] && echo 1 || echo 0)"

# ---- 3. one subpage with its subjects
visit "/page?slug=$slug_a"
check 'a subpage answers 200 without a login' "$(status_is 200)"
check 'page returns a "page" object' "$(has '"page":{')"
check 'page gives its menu_name' "$(has '"menu_name":"Pub A"')"
check 'page gives its slug' "$(has "\"slug\":\"$slug_a\"")"
check 'a subpage has an empty "subpages" list' "$(has '"subpages":[]')"
check 'page contains the published subjects' "$([ "$(has 'Shown first')" = 1 ] && [ "$(has 'Shown second')" = 1 ] && echo 1 || echo 0)"
check 'subjects carry their content' "$(has '"content":"Content of Shown first"')"
check 'subjects carry a numeric "id"' "$(grep -Eq '"id":[0-9]+' "$body" && echo 1 || echo 0)"
first=$(grep -Eo 'Shown (first|second)' "$body" | head -1)
check 'subjects are ordered by position' "$([ "$first" = 'Shown first' ] && echo 1 || echo 0)"
check 'the hidden subject is not sent' "$(lacks 'Secret hidden')"
check 'the draft subject is not sent' "$(lacks 'Secret draft')"
check 'the archived subject is not sent' "$(lacks 'Secret archived')"
leaks=0
for key in ID page_ID parent_ID status visible position max_element image_ID created_at updated_at; do
    if grep -qF "\"$key\":" "$body"; then leaks=1; fi
done
check 'page exposes no internal fields' "$([ "$code" = 200 ] && [ "$leaks" = 0 ] && echo 1 || echo 0)"

visit "/page?slug=$slug_b"
check 'a page without subjects answers 200' "$(status_is 200)"
check 'and its subjects list is empty' "$(has '"subjects":[]')"

# ---- 4. hidden means "does not exist"
visit "/page?slug=test-pub-nothing-$suffix"
check 'an unknown slug answers 404' "$(status_is 404)"
unknown_answer=$(cat "$body")
# same_as_unknown : 1 if the last answer is the 404 an unknown slug gets
same_as_unknown() { [ "$code" = 404 ] && [ "$(cat "$body")" = "$unknown_answer" ] && echo 1 || echo 0; }
for slug in "$slug_h" "$slug_d" "$slug_r"; do
    visit "/page?slug=$slug"
    check "$slug looks exactly like an unknown slug" "$(same_as_unknown)"
done
call GET "/page?slug=$slug_h" '' 1
check 'even a logged-in admin gets 404 on the public route' "$(status_is 404)"

# ---- 5. a hidden parent hides its subpages
set_about 's/"visible":1/"visible":0/'
check 'the admin hides "about" (200)' "$(status_is 200)"
visit /menu
check '"about" leaves the menu' "$(lacks '"slug":"about"')"
visit '/page?slug=about'
check '"about" now looks like an unknown slug' "$(same_as_unknown)"
visit "/page?slug=$slug_a"
check 'a visible subpage of a hidden page looks like an unknown slug' "$(same_as_unknown)"
set_about 's/"status":"published"/"status":"draft"/'
visit "/page?slug=$slug_a"
check 'a subpage of a draft page looks like an unknown slug' "$(same_as_unknown)"
set_about ''
check '"about" is restored (200)' "$(status_is 200)"
visit "/page?slug=$slug_a"
check 'the subpage is back' "$(status_is 200)"

# ---- 6. bad slugs
visit '/page'
check 'a missing slug answers 400' "$(status_is 400)"
visit '/page?slug='
check 'an empty slug answers 400' "$(status_is 400)"
visit '/page?slug=ABC'
check 'capital letters answer 400' "$(status_is 400)"
visit '/page?slug=a%20b'
check 'a space answers 400' "$(status_is 400)"
visit "/page?slug=$slug_a%0A"
check 'a trailing newline answers 400 (the D modifier)' "$(status_is 400)"
visit '/page?slug%5B%5D=x'
check 'an array instead of a string answers 400' "$(status_is 400)"
visit '/page?slug=%27%20OR%201%3D1%20--%20'
check 'an SQL injection attempt answers 400' "$(status_is 400)"
long=$(head -c 101 /dev/zero | tr '\0' 'a')
visit "/page?slug=$long"
check 'a slug of 101 characters answers 400' "$(status_is 400)"
visit "/page?slug=${long:1}"
check 'a slug of 100 characters is accepted (404, no such page)' "$(status_is 404)"

# ---- 7. what the admin changes, the visitor sees
call POST "/admin/page/update?id=$page_a" "{\"parent_ID\":$about_id,\"menu_name\":\"Pub A\",\"slug\":\"$slug_a\",\"position\":2,\"visible\":0,\"status\":\"published\",\"max_element\":10}"
check 'the admin hides subpage A (200)' "$(status_is 200)"
visit '/page?slug=about'
check 'subpage A leaves the list of its parent' "$(lacks "$slug_a")"
visit "/page?slug=$slug_a"
check 'subpage A now answers 404' "$(status_is 404)"

# ---- cleanup
setup_ok=1
for id in "$page_a" "$page_b" "$page_h" "$page_d" "$page_r"; do
    call POST "/admin/page/delete?id=$id"
    if [ "$code" != 200 ]; then setup_ok=0; fi
done
check 'cleanup: the 5 test subpages are deleted' "$setup_ok"

echo
if [ "$failures" -eq 0 ]; then echo 'ALL CHECKS PASSED'; exit 0; fi
echo "$failures CHECK(S) FAILED"; exit 1
