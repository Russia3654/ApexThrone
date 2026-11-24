#!/usr/bin/env bash
# Checks for the subjects API: create (slice 1), list and show (slice 2), update and move (slice 3), delete (slice 4).
# Run from the project root:
#   ADMIN_PASSWORD='your-dev-password' bash backend/tests/subjects.sh [base-url]
# Needs the PHP dev server running, the seed admin, and the pages + subjects tables (001_content.sql).
# It creates its own test page (slug starting with "test-subj-") and deletes it at the end.
# Deleting the page also deletes its subjects (ON DELETE CASCADE). If the script stops early, remove leftovers with:
#   DELETE FROM pages WHERE slug LIKE 'test-subj-%';

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

# subject_json <page id> : a valid subject body for that page
subject_json() {
    echo "{\"page_ID\":$1,\"menu_name\":\"Test subject\",\"position\":1,\"visible\":1,\"content\":\"Hello\",\"status\":\"draft\"}"
}

suffix="$(date +%s)$RANDOM"
slug="test-subj-$suffix"

# 1. nothing works without a login
call POST /admin/subjects "$(subject_json 1)" 0
check 'create without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# 2. log in, then make a test page that holds at most 2 subjects
call POST /admin/login "{\"username\":\"admin\",\"password\":\"$PASS_OK\"}"
check 'login answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

call POST /admin/pages "{\"menu_name\":\"Test subjects page\",\"slug\":\"$slug\",\"position\":1,\"visible\":0,\"status\":\"draft\",\"max_element\":2}"
check 'setup: the test page is created (201)' "$([ "$code" = 201 ] && echo 1 || echo 0)"
page_id=$(grep -Eo '"id":[0-9]+' "$body" | head -1 | cut -d: -f2)

# 3. bad bodies are refused with 400, and none of them uses up a place on the page
call POST /admin/subjects 'this is not json'
check 'a body that is not JSON answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/subjects "{\"page_ID\":$page_id,\"menu_name\":\"x\",\"position\":1,\"visible\":1,\"status\":\"draft\"}"
check 'a missing "content" answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/subjects "{\"page_ID\":\"$page_id\",\"menu_name\":\"x\",\"position\":1,\"visible\":1,\"content\":\"c\",\"status\":\"draft\"}"
check 'page_ID sent as a string answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/subjects "{\"page_ID\":0,\"menu_name\":\"x\",\"position\":1,\"visible\":1,\"content\":\"c\",\"status\":\"draft\"}"
check 'page_ID 0 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/subjects "{\"page_ID\":$page_id,\"menu_name\":\"\",\"position\":1,\"visible\":1,\"content\":\"c\",\"status\":\"draft\"}"
check 'an empty menu_name answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/subjects "{\"page_ID\":$page_id,\"menu_name\":\"x\",\"position\":0,\"visible\":1,\"content\":\"c\",\"status\":\"draft\"}"
check 'position 0 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/subjects "{\"page_ID\":$page_id,\"menu_name\":\"x\",\"position\":1,\"visible\":2,\"content\":\"c\",\"status\":\"draft\"}"
check 'visible 2 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

call POST /admin/subjects "{\"page_ID\":$page_id,\"menu_name\":\"x\",\"position\":1,\"visible\":1,\"content\":\"c\",\"status\":\"secret\"}"
check 'an unknown status answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

long=$(head -c 20001 /dev/zero | tr '\0' 'a')
call POST /admin/subjects "{\"page_ID\":$page_id,\"menu_name\":\"x\",\"position\":1,\"visible\":1,\"content\":\"$long\",\"status\":\"draft\"}"
check 'content of 20001 characters answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

# 4. a valid body for a page that does not exist -> 404
call POST /admin/subjects "$(subject_json 999999999)"
check 'a page that does not exist answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"

# 5. a valid subject
call POST /admin/subjects "$(subject_json "$page_id")"
check 'create answers 201' "$([ "$code" = 201 ] && echo 1 || echo 0)"
check 'create returns an id' "$(grep -Eq '"id":[0-9]+' "$body" && echo 1 || echo 0)"
subject_id=$(grep -Eo '"id":[0-9]+' "$body" | head -1 | cut -d: -f2)
check 'create returns the page_ID' "$(grep -q "\"page_ID\":$page_id" "$body" && echo 1 || echo 0)"
check 'create returns the menu_name' "$(grep -q '"menu_name":"Test subject"' "$body" && echo 1 || echo 0)"
check 'create returns visible as true' "$(grep -q '"visible":true' "$body" && echo 1 || echo 0)"
check 'create returns the content' "$(grep -q '"content":"Hello"' "$body" && echo 1 || echo 0)"

# 6. an empty content is allowed (fills the second and last place of the page)
call POST /admin/subjects "{\"page_ID\":$page_id,\"menu_name\":\"Empty\",\"position\":2,\"visible\":0,\"content\":\"\",\"status\":\"draft\"}"
check 'an empty content is accepted (201)' "$([ "$code" = 201 ] && echo 1 || echo 0)"
subject2_id=$(grep -Eo '"id":[0-9]+' "$body" | head -1 | cut -d: -f2)

# 7. the page holds 2 subjects and its max_element is 2 -> the third is refused
call POST /admin/subjects "$(subject_json "$page_id")"
check 'a third subject on a page with max_element 2 answers 409' "$([ "$code" = 409 ] && echo 1 || echo 0)"
check 'the 409 is a JSON error' "$(grep -q '"error"' "$body" && echo 1 || echo 0)"

# ---- slice 2: list and show (the page now holds 2 subjects: "Test subject" at position 1, "Empty" at position 2)

# 8. nothing is readable without a login
call GET /admin/subjects '' 0
check 'list without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"
call GET "/admin/subject?id=$subject_id" '' 0
check 'show without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# 9. list everything
call GET /admin/subjects
check 'list answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'list returns a "subjects" array' "$(grep -q '"subjects":\[' "$body" && echo 1 || echo 0)"
check 'list contains the new subjects' "$(grep -q '"menu_name":"Test subject"' "$body" && grep -q '"menu_name":"Empty"' "$body" && echo 1 || echo 0)"

# 10. list filtered by page
call GET "/admin/subjects?page_ID=$page_id"
check 'filtered list answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'filtered list holds both subjects of the page' "$(grep -q '"menu_name":"Test subject"' "$body" && grep -q '"menu_name":"Empty"' "$body" && echo 1 || echo 0)"
first_name=$(grep -Eo '"menu_name":"[^"]*"' "$body" | head -1)
check 'filtered list is ordered by position (position 1 first)' "$([ "$first_name" = '"menu_name":"Test subject"' ] && echo 1 || echo 0)"
check 'every subject in the filtered list belongs to the page' "$([ "$(grep -Eo '"page_ID":[0-9]+' "$body" | sort -u)" = "\"page_ID\":$page_id" ] && echo 1 || echo 0)"

call GET '/admin/subjects?page_ID=999999999'
check 'a filter on a page that does not exist answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'that filter returns an empty list' "$(grep -q '"subjects":\[\]' "$body" && echo 1 || echo 0)"

call GET '/admin/subjects?page_ID=abc'
check 'a filter that is not a number answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call GET '/admin/subjects?page_ID=0'
check 'a filter of 0 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call GET '/admin/subjects?page_ID='
check 'an empty filter answers 400 (a bad filter is never ignored)' "$([ "$code" = 400 ] && echo 1 || echo 0)"

# 11. show one subject
call GET "/admin/subject?id=$subject_id"
check 'show answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'show returns a "subject" object' "$(grep -q '"subject":{' "$body" && echo 1 || echo 0)"
check 'show returns the right id' "$(grep -q "\"id\":$subject_id," "$body" && echo 1 || echo 0)"
check 'show returns the right name' "$(grep -q '"menu_name":"Test subject"' "$body" && echo 1 || echo 0)"

call GET '/admin/subject?id=999999999'
check 'show of an id that does not exist answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"
call GET '/admin/subject?id=abc'
check 'show with a bad id answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call GET '/admin/subject'
check 'show without an id answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"

# ---- slice 3: update (and moving a subject to another page)
# State now: page A (max 2) holds subject 1 "Test subject" (position 1) and subject 2 "Empty" (position 2).

# upd_json <page id> <menu_name> <content> : a valid update body
upd_json() {
    echo "{\"page_ID\":$1,\"menu_name\":\"$2\",\"position\":1,\"visible\":1,\"content\":\"$3\",\"status\":\"draft\"}"
}

# 12. nothing can be changed without a login
call POST "/admin/subject/update?id=$subject_id" "$(upd_json "$page_id" 'Nope' 'x')" 0
check 'update without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"

# 13. editing a subject inside its own FULL page works (page A holds 2 of 2)
call POST "/admin/subject/update?id=$subject_id" "$(upd_json "$page_id" 'Renamed subject' 'Edited')"
check 'update on a full page, same page, answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'update returns a "subject" object' "$(grep -q '"subject":{' "$body" && echo 1 || echo 0)"
check 'update returns the new name' "$(grep -q '"menu_name":"Renamed subject"' "$body" && echo 1 || echo 0)"
check 'update returns the new content' "$(grep -q '"content":"Edited"' "$body" && echo 1 || echo 0)"
check 'update keeps the same page_ID' "$(grep -q "\"page_ID\":$page_id" "$body" && echo 1 || echo 0)"

call GET "/admin/subject?id=$subject_id"
check 'the change is really stored (show returns the new name)' "$(grep -q '"menu_name":"Renamed subject"' "$body" && echo 1 || echo 0)"

# 14. saving the same values again is a success (MySQL reports 0 affected rows, we must not treat it as an error)
call POST "/admin/subject/update?id=$subject_id" "$(upd_json "$page_id" 'Renamed subject' 'Edited')"
check 'saving identical values answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# 15. bad input
call POST "/admin/subject/update?id=$subject_id" "{\"page_ID\":$page_id,\"menu_name\":\"x\",\"position\":1,\"visible\":2,\"content\":\"c\",\"status\":\"draft\"}"
check 'update with visible 2 answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call POST "/admin/subject/update?id=999999999" "{\"page_ID\":$page_id,\"menu_name\":\"\",\"position\":1,\"visible\":1,\"content\":\"c\",\"status\":\"draft\"}"
check 'a bad body on an unknown id answers 400 (validation runs first)' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call POST "/admin/subject/update?id=$subject_id" 'not json'
check 'update with a body that is not JSON answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call POST '/admin/subject/update?id=abc' "$(upd_json "$page_id" 'x' 'x')"
check 'update with a bad id answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call POST '/admin/subject/update' "$(upd_json "$page_id" 'x' 'x')"
check 'update without an id answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call POST '/admin/subject/update?id=999999999' "$(upd_json "$page_id" 'x' 'x')"
check 'update of an id that does not exist answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"

# 16. moving: make a second page B that holds only 1 subject
slug_b="test-subj-b-$suffix"
call POST /admin/pages "{\"menu_name\":\"Test page B\",\"slug\":\"$slug_b\",\"position\":2,\"visible\":0,\"status\":\"draft\",\"max_element\":1}"
check 'setup: the second test page is created (201)' "$([ "$code" = 201 ] && echo 1 || echo 0)"
page_b=$(grep -Eo '"id":[0-9]+' "$body" | head -1 | cut -d: -f2)

call POST "/admin/subject/update?id=$subject_id" "$(upd_json "$page_b" 'Renamed subject' 'Edited')"
check 'moving a subject to a page with room answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'the answer shows the new page_ID' "$(grep -q "\"page_ID\":$page_b" "$body" && echo 1 || echo 0)"

call GET "/admin/subjects?page_ID=$page_b"
check 'the moved subject is listed under page B' "$(grep -q '"menu_name":"Renamed subject"' "$body" && echo 1 || echo 0)"
call GET "/admin/subjects?page_ID=$page_id"
check 'the moved subject is no longer listed under page A' "$(grep -q '"menu_name":"Renamed subject"' "$body" && echo 0 || echo 1)"

# 17. page B is now full (1 of 1): a second subject cannot move in, and nothing changes
call POST "/admin/subject/update?id=$subject2_id" "$(upd_json "$page_b" 'Empty' '')"
check 'moving into a full page answers 409' "$([ "$code" = 409 ] && echo 1 || echo 0)"
call GET "/admin/subject?id=$subject2_id"
check 'the refused move changed nothing (still on page A)' "$(grep -q "\"page_ID\":$page_id" "$body" && echo 1 || echo 0)"

# 18. moving to a page that does not exist
call POST "/admin/subject/update?id=$subject2_id" "$(upd_json 999999999 'Empty' '')"
check 'moving to a page that does not exist answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"

# 19. the full page B can still edit its own subject
call POST "/admin/subject/update?id=$subject_id" "$(upd_json "$page_b" 'Edited on a full page' 'Again')"
check 'editing a subject on a full page B (same page) answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# ---- slice 4: delete
# State now: page A holds subject 2 "Empty" (1 of 2); page B holds subject 1 "Edited on a full page" (1 of 1, full).

# 20. nothing can be deleted without a login
call POST "/admin/subject/delete?id=$subject2_id" '' 0
check 'delete without a login answers 401' "$([ "$code" = 401 ] && echo 1 || echo 0)"
call GET "/admin/subject?id=$subject2_id"
check 'the refused delete changed nothing (the subject still exists)' "$([ "$code" = 200 ] && echo 1 || echo 0)"

# 21. bad ids
call POST '/admin/subject/delete?id=abc'
check 'delete with a bad id answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call POST '/admin/subject/delete'
check 'delete without an id answers 400' "$([ "$code" = 400 ] && echo 1 || echo 0)"
call POST '/admin/subject/delete?id=999999999'
check 'delete of an id that does not exist answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"

# 22. a real delete
call POST "/admin/subject/delete?id=$subject2_id"
check 'delete answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
check 'delete answers {"ok":true}' "$(grep -q '"ok":true' "$body" && echo 1 || echo 0)"
call GET "/admin/subject?id=$subject2_id"
check 'the deleted subject is gone (show answers 404)' "$([ "$code" = 404 ] && echo 1 || echo 0)"
call GET "/admin/subjects?page_ID=$page_id"
check 'the deleted subject is no longer in its page list' "$(grep -q '"menu_name":"Empty"' "$body" && echo 0 || echo 1)"
call POST "/admin/subject/delete?id=$subject2_id"
check 'deleting the same subject again answers 404' "$([ "$code" = 404 ] && echo 1 || echo 0)"

# 23. a delete frees a place: page B was full, now it has room again
call POST "/admin/subjects" "$(subject_json "$page_b")"
check 'page B is full: a new subject is refused (409)' "$([ "$code" = 409 ] && echo 1 || echo 0)"
call POST "/admin/subject/delete?id=$subject_id"
check 'delete of the subject on page B answers 200' "$([ "$code" = 200 ] && echo 1 || echo 0)"
call POST "/admin/subjects" "$(subject_json "$page_b")"
check 'after the delete, page B accepts a new subject (201)' "$([ "$code" = 201 ] && echo 1 || echo 0)"
new_id=$(grep -Eo '"id":[0-9]+' "$body" | head -1 | cut -d: -f2)

# cleanup: deleting a page also deletes its subjects (ON DELETE CASCADE)
call POST "/admin/page/delete?id=$page_b"
check 'cleanup: the second test page is deleted (200)' "$([ "$code" = 200 ] && echo 1 || echo 0)"
call GET "/admin/subject?id=$new_id"
check 'deleting a page also deleted its subject (cascade)' "$([ "$code" = 404 ] && echo 1 || echo 0)"
call POST "/admin/page/delete?id=$page_id"
check 'cleanup: the test page is deleted (200)' "$([ "$code" = 200 ] && echo 1 || echo 0)"

echo
if [ "$failures" -eq 0 ]; then echo 'ALL CHECKS PASSED'; exit 0; fi
echo "$failures CHECK(S) FAILED"; exit 1
