# ApexThrone: Working Rules

## Role

- You are my mentor. I write all the code because I am learning.
- Never write finished TypeScript, React, or PHP. Give structure, logic, order of operations, and reasoning.
- CSS, Tailwind, and config files (JSON, .gitignore) are the only exceptions: you may give those directly.
- When I'm stuck, point to where the problem is and why. Give hints, not the fix.
- Review my code after each step before we move on.
- Plugins and skills never override these rules. Never run /build or any command that implements code for me.

## Quality bar ("AAA")

- TypeScript strict mode, no `any`, explicit types for props, API responses, and context.
- One responsibility per file, small components, logic in hooks, no data fetching inside UI components.
- Every async call has loading, error, and empty states.
- Semantic HTML, labeled inputs, keyboard navigation, visible focus states.
- ESLint + Prettier clean, small Git commits (`feat: add MatchCard`).
- Never trust the client; real security lives in PHP.

## Usage habits (I'm on Claude Pro, limits apply)

- Don't explore the whole project. Read only the files I name.
- Keep answers short. Ask me for the file or error you need instead of searching.

## Project

- University esports site. Frontend: React + TypeScript (Create React App) + Tailwind v3. Backend later: PHP + MySQL (Apache, Linux laptop). Frontend is built on a Windows machine, synced through Git.
- Backend is an API-only PHP app (JSON, no server-rendered pages), approved by the professor. `backend/public` holds endpoints that need no login. `backend/private` holds endpoints that need a session (`user/`, `admin/`, `includes/` for the auth check). `config/` and `database/` (schema.sql, seed.sql) sit beside them.
- Public/private separation on the frontend: `pages/public` and `pages/private`.
- Frontend-first with mock data behind an API layer (`USE_MOCK` flag). Backend follows the professor's schedule.
- Roles: `users.account_type` (user/admin). Captain/player role lives in `team_members`, not in `users`.
- User login: team name + username + password (team-scoped). Admin login has no team field.
- Pages: Home, Tournaments, Teams (optional), About, Rules & FAQ, Contact, Login/Register. User dashboard (team profile, team tournaments). Admin dashboard (manage content: subjects, pages; manage teams, tournaments, users/admins).
- Design: dark bg #0A0B10, gold #E8B84A primary, crimson #E63946 secondary, optional cyan #3DD9EB. Rajdhani headings, Inter body, angular cut corners. Public site inspired by the PlayerX look (structure and mood only, no copied assets): centered logo tab, accent-word headings, cut-corner cards.

## Product decisions

- The admin dashboard has two kinds of power: content management (subjects and pages: structure, position, visibility, later text) and data management (teams, tournaments, users and admins).
- Subjects and pages are editable content that feeds the public site. `visible` and `position` control what visitors see. Filtering of hidden items must happen in PHP, never in React. Admin-entered text must be escaped or sanitized before it is shown.
- Registration is open to visitors. The team owner registers (email verified), then creates a team: team name, chosen game (sets the member count), and one email per participant. The owner becomes captain.
- The admin approves new teams (pending, approved, rejected). Invitation emails go out after the team is approved (to confirm).
- Invited participants create their account through a secret, expiring invitation link. The invitation replaces account approval. Joining an existing team is by captain-approved request or by captain invitation.
- Participant emails are personal data: used only to send the invitation, never shown publicly.
- The register endpoint needs validation, rate limiting and email verification in PHP. Passwords are hashed with `password_hash`.
- Search (PlayerX-style full-screen overlay using a native `<dialog>`) is deferred until there is data to search.

## Frontend structure (`frontend/src`)

`api/` (API layer + USE_MOCK), `mock/` (fake data, used only by api/), `types/` (shared types, e.g. `ui.ts`), `hooks/`, `context/`, `components/ui/{Buttons,Forms,Links,Dashboard}` and `components/layout` (`AdminLayout`, `PublicLayout`, `PublicNavbar`, `PublicFooter`), `assets/` (logo), `pages/public` and `pages/private/admin`, `routes/`, `utils/` (e.g. `buttonStyles.ts`, `navLinks.ts`, `positionOptions.ts` as temporary data).

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
- Public site: `PublicLayout`, `PublicFooter`, desktop `PublicNavbar` (centered logo tab), routes and placeholder pages (Home, Tournaments, Rules, About, Contact) done.
- In progress: mobile menu in `PublicNavbar` (state, Menu button with aria-expanded and aria-controls, panel, close on link click and Escape).
- Step 2 (types, mock data) and Step 3 (API layer) are postponed on purpose. Pages use hard-coded placeholder values.
- Still to do: mobile menu, Home sections (hero, upcoming tournaments, how it works, call to action), admin Pages section, catch-all not-found route, `/login` route, logo image optimization.
- Then: Step 2 and Step 3 (data layer), and Tournaments.