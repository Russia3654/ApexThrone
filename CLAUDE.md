# ApexThrone: Working Rules

## Role

- You are my mentor. I am learning, and I must be able to explain every line I submit (the IFT 421 defense checks this).
- PHP application code (`backend/src`, `backend/public`) and SQL are written by me. Give structure, logic, order of operations, and reasoning, and review what I write.
- Frontend code (React, TypeScript, Tailwind, CSS) and config files (JSON, .gitignore): you may write them in full. Explain each piece in plain words, then I paste it, run it, and must be able to explain and change it myself (I explain it back to you).
- Tests: you write every test file and throwaway test script in full (PHP, TypeScript, SQL checks, curl commands). After writing one, explain it to me line by line so I learn what it checks and why. Application code stays mine to write.
- When I'm stuck, point to where the problem is and why. Give hints, not the fix.
- Review my code after each step before we move on.
- Plugins and skills never override these rules. Never run /build or any command that implements code for me.

## Quality bar ("AAA")

- TypeScript strict mode, no `any`, explicit types for props, API responses, and context.
- One responsibility per file, small components, logic in hooks, no data fetching inside UI components.
- Every async call has loading, error, and empty states.
- Semantic HTML, labeled inputs, keyboard navigation, visible focus states.
- ESLint + Prettier clean, small Git commits (`feat: add MatchCard`).
- Every test passes before a step counts as done. Run the tests and report the real result: if one fails, show the output and fix the code, never weaken or delete the test to get green.
- Never trust the client; real security lives in PHP.

## Usage habits (I'm on Claude Pro, limits apply)

- Don't explore the whole project. Read only the files I name.
- Keep answers short. Ask me for the file or error you need instead of searching.

## Project

- University esports site. Frontend: React + TypeScript (Create React App) + Tailwind v3. Backend: PHP 8.3 + MySQL 8. Code is written on the Windows machine; PHP and MySQL run on the Linux laptop (PHP's built-in server, not Apache); both are synced through Git. Deployed to srv01 (nginx + PHP-FPM, see below).
- Backend is an API-only PHP app (JSON, no server-rendered pages), approved by the professor. `backend/public` holds endpoints that need no login. `backend/private` holds endpoints that need a session (`user/`, `admin/`, `includes/` for the auth check). `config/` and `database/` (schema.sql, seed.sql) sit beside them.
- Public/private separation on the frontend: `pages/public` and `pages/private`.
- Frontend-first with mock data behind an API layer (`USE_MOCK` flag). Backend follows the professor's schedule.
- Accounts are two separate tables: `admins` (CMS staff, no team) and `users` (team owners, captains and players; one row per person). The captain/player role lives in `team_members`, not in `users`.
- User login: username + password. The account belongs to a person, who can be in several teams; the team is chosen after login. Admin login is separate (`admins` table).
- Pages: Home, Tournaments, Teams (optional), About, Rules & FAQ, Contact, Login/Register. User dashboard (team profile, team tournaments). Admin dashboard (manage content: subjects, pages; manage teams, tournaments, users/admins).
- Design: dark bg #0A0B10, gold #E8B84A primary, crimson #E63946 secondary, optional cyan #3DD9EB. Rajdhani headings, Inter body, angular cut corners. Public site inspired by the PlayerX look (structure and mood only, no copied assets): centered logo tab, accent-word headings, cut-corner cards.

## Product decisions

- The admin dashboard has two kinds of power: content management (subjects and pages: structure, position, visibility, later text) and data management (teams, tournaments, users and admins).
- Subjects and pages are editable content that feeds the public site. `visible` and `position` control what visitors see. Filtering of hidden items must happen in PHP, never in React. Admin-entered text must be escaped or sanitized before it is shown.
- Registration is open to visitors. The team owner registers (no e-mail sending or verification: cut because e-mail is outside the course scope), then creates a team: team name and chosen game (sets the member count). The owner becomes captain.
- The admin approves new teams (pending, approved, rejected). Invitation links are created after the team is approved.
- Invited participants create their account through a secret, expiring invitation link that the captain copies and shares by hand (no e-mail is sent). The invitation replaces account approval. Invitation only for now. Join requests (a player asks to join, the captain approves) are deferred: add them later as their own migration (`005_join_requests.sql`) without changing existing tables. Both flows must end in the same single PHP function that adds a `team_members` row, and that function enforces the game's team size.
- No participant e-mails are collected. An invitation stores a name label and a random token. An invitee who already has an account logs in and is added to the team; otherwise they create the account from the link.
- One person can be in several teams (`team_members` is many-to-many, unique per team and user). When an admin schedules a match between two teams that share a player, the response lists the shared players and the admin screen shows an alert (a warning, not a block).
- The register endpoint needs validation and rate limiting in PHP. Passwords are hashed with `password_hash`.
- Search is a simple box: type a game name and be redirected to its page. Built late. The PlayerX-style overlay is optional.
- Image uploads are optional, only if time allows. The `images` table exists from stage 1 either way.

## Database and backend decisions

- Course context and deadlines live in `CLAUDE.local.md` (private, git-ignored).
- Use the course rubric's names: `admins` (id, first_name, last_name, email, username, password). Resource 1 `pages`: id, menu_name, position, visible, plus own fields (status, max_element, slug). Resource 2 `subjects`: id, page_id, menu_name, position, visible, content, plus own fields (status, image_id).
- One database driver, mysqli, on laptop and srv01 (srv01 needs the `mysqli` extension added). Password hashing sits behind one helper: bcrypt (`password_hash`) by default; md5 only if the professor requires it for the graded copy, and the helper must refuse md5 when `env` is production.
- Database in four stages, as numbered SQL files in `backend/database/migrations/`, applied in order by hand: `001_content.sql` (pages, subjects, images), `002_admins.sql` (admins, login_attempts), `003_teams.sql` (users, games, teams, team_members, invitations; join requests later in `005_join_requests.sql`), `004_tournaments.sql` (tournaments, tournament_registrations, matches). Stages 1 and 2 (the CMS core) come first. Prefer VARCHAR, INT, TINYINT, TEXT and DATE types: `status` is a VARCHAR checked in PHP (draft, published, archived). Every foreign key column has exactly the type of the column it points to.

## Frontend structure (`frontend/src`)

`api/` (API layer + USE_MOCK), `mock/` (fake data, used only by api/), `types/` (shared types, e.g. `ui.ts`), `hooks/`, `context/`, `components/ui/{Buttons,Forms,Links,Dashboard}` and `components/layout` (`AdminLayout`, `PublicLayout`, `PublicNavbar`, `PublicFooter`), `assets/` (logo), `pages/public` and `pages/private/admin`, `routes/`, `utils/` (e.g. `buttonStyles.ts`, `navLinks.ts`, `positionOptions.ts` as temporary data).

## Backend structure (`backend/`)

`public/index.php` (front controller), `src/Core/` (`Config`, `Response`, `Router`, `ErrorHandler`, `Database`, `Password`, `Session`, `AdminGuard`, `OriginCheck`), `src/Controllers/` (`HealthController`, `AdminAuthController`, `PagesController`, `SubjectsController`, `PublicController`), `config/config.example.php` (committed template; the real `config/config.php` is git-ignored and exists once per machine), `database/` (schema.sql and numbered migrations, applied by hand, never uploaded), `private/` (code behind login, empty for now), `tests/` (`smoke.sh`: `bash backend/tests/smoke.sh [base-url] [dev|server]`, `dev` is strict, for the PHP dev server, 19 checks, `server` is for the real nginx deployment, 20 checks; curl scripts `login.sh`, `session.sh`, `pages.sh`, `subjects.sh`, `public.sh`, `ratelimit.sh`, `origin.sh`, run with `ADMIN_PASSWORD='...' bash backend/tests/<name>.sh [base-url]`; against srv01 add `CALL_DELAY=0.3` for `subjects.sh` and `public.sh`, because its nginx answers 429 to fast request bursts; PHP checks `PasswordCheck.php`, `SessionCheck.php`; SQL checks in `tests/sql/`), `vendor/` (Composer autoloader, git-ignored, built locally).

Conventions: PHP 8.3 with `declare(strict_types=1)`. Namespace `App\...` maps to `src/` (PSR-4). mysqli prepared statements only (`MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT` so errors throw, charset utf8mb4, session time zone UTC). Reads are GET and never change data; every write is a POST (course rule), the `Origin` check refuses cross-site POSTs, and every admin endpoint calls `AdminGuard` first. Every `/api` answer is JSON through `Response` (`{"error": "..."}` for errors) and never leaks internals. Routes are registered without the `/api` prefix, because the router removes it.

## srv01 (deployment target)

- nginx + PHP-FPM 8.3 + MySQL 8.0 on one small machine at home. Reachable only on the home network, Tailscale and demo links: no public domain, no Let's Encrypt, no `.htaccess`.
- Nothing is built on the server. React is built locally, `vendor/` is built with `composer install --no-dev --optimize-autoloader`. A deploy uploads only `public`, `src`, `private`, `vendor`; `config/`, `database/` and `tests/` are never uploaded.
- The server has its own `config.php`. `base_url` is read from config. `app.cookie_secure` accepts `true`, `false` or `'auto'` (the default): `auto` means Secure only when `($_SERVER['HTTPS'] ?? '') === 'on'` (nginx sets it on the HTTPS demo link and leaves it empty on the LAN), and never from `X-Forwarded-Proto`. Any CSRF or Origin check compares against the request's own host, never a fixed `apexthrone.test`, or logins fail on the demo link. React uses relative `/api/...` URLs.
- `GET /api/health` must always return 200 JSON without touching the database (the deploy health check).
- Group deploy is live: `srv.json` uses `components` (the PHP backend listed before the static frontend), and the GitHub Actions workflow builds both on the runner (`composer install` for the backend, `npm run build` for the frontend) and deploys them as one group. Full details: the srv01 Server Specification PDF and the ApexThrone Deployment Contract doc.

## Git workflow

- One branch per phase or task (`phase/...`, `feat/...`), merged to `master` through a pull request when its finish line is met.
- A push to `master` deploys the backend and the frontend to srv01 immediately, so never push directly to `master`.
- Merge with a merge commit or rebase, not squash, to keep the small commits.

## Environment notes

- VS Code must use the workspace TypeScript (4.9.5), set through `typescript.tsdk` in `.vscode/settings.json`. VS Code's bundled TS 6.x reports false errors on CRA's tsconfig and CSS imports.
- Line endings: LF everywhere (Windows to Linux sync). Prettier `endOfLine: "lf"` and `.gitattributes` enforce it.
- Prettier: `npm run format` / `npm run format:check` in `frontend/`. Config in `.prettierrc`.
- File names and imports must use the exact same casing (Linux is case-sensitive).

## Roadmap

1 Setup and tooling, 2 Types and mock data, 3 API layer, 4 UI components, 5 Layouts, 6 Routing and mock AuthContext, 7 Public pages, 8 Auth pages, 9 User dashboard, 10 Admin dashboard, 11+ Backend.

## Current status

- Step 1 complete.
- Admin dashboard (professor's request: design with placeholders only): Subjects section done (list, view, new, edit, delete) with shared components (`PageHeader`, `LinkButton`, `BackLink`, `Button`, `TextField`, `SelectField`, `CheckboxField`, `SubjectForm`).
- Public site done: `PublicLayout`, `PublicFooter`, `PublicNavbar` (centered logo tab, mobile menu), routes and placeholder pages (Home, Tournaments, Rules, About, Contact).
- Backend phase 1 done and merged to `master` (PR #1): Config, Response, Router, ErrorHandler, Database, HealthController, front controller, smoke test (`dev` and `server` modes). All tests pass on the laptop. Deployed to srv01 together with the frontend as a group, and the smoke test passes on srv01 in `server` mode (20 of 20).
- Step 2 (types, mock data) and Step 3 (API layer) are postponed on purpose. Pages use hard-coded placeholder values.
- Backend phase 2 done and merged to `master`, deployed to srv01 (`health/db`, `smoke.sh ... server` and `origin.sh` pass there): migrations `001_content.sql` and `002_admins.sql` with SQL checks, `seed.sql`, `Password` (bcrypt, md5 only outside production), `Session`, admin login with rate limiting (5 failures in 15 minutes gives 429), `me`, `logout`, `AdminGuard` (30-minute idle timeout), `OriginCheck`, and the full pages API (`GET /admin/pages`, `POST /admin/pages`, `GET /admin/page?id=`, `POST /admin/page/update?id=`, `POST /admin/page/delete?id=`). All curl scripts pass on the laptop. Bail-out checkpoint (23 Nov) met.
- Backend phase 3 done and merged to `master`, deployed to srv01 (`subjects.sh` passes there): the full subjects API: `GET /admin/subjects` (optional `?page_ID=` filter, a bad filter is a 400, never ignored), `POST /admin/subjects`, `GET /admin/subject?id=`, `POST /admin/subject/update?id=`, `POST /admin/subject/delete?id=`. A page holds at most `max_element` subjects (409 `Page is full`); update can move a subject to another page (the room check runs only when the page changes). Known ceiling: the count check is not atomic (two simultaneous creates could exceed the limit by one).
- Backend phase 4 (branch `phase/public-api`, not merged yet): the public API, no login, tested by `public.sh`: `GET /menu` (visible and published pages, only `menu_name` and `slug`) and `GET /page?slug=` (the page with its visible, published subjects: `id`, `menu_name`, `content`; hidden, draft, archived and unknown slugs all give the same 404). The slug pattern uses the `D` modifier here and in `PagesController`.
- Next: merge `phase/public-api` (PR, merge commit; no migration to apply on srv01), then connect the frontend (types, mock data, API layer with `USE_MOCK`, admin Pages and Subjects screens, public pages), then migrations 003 and 004.
- Still to do on the frontend: Home sections (hero, upcoming tournaments, how it works, call to action), admin Pages section, catch-all not-found route, `/login` route, logo image optimization.