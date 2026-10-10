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
- Pages: Home, Tournaments, Teams (optional), About, Rules & FAQ, Contact, Login/Register. User dashboard (team profile, team tournaments). Admin dashboard (manage content: subjects, pages; manage users/admins).
- Design: dark bg #0A0B10, gold #E8B84A primary, crimson #E63946 secondary, optional cyan #3DD9EB. Rajdhani headings, Inter body, angular cut corners.

## Frontend structure (`frontend/src`)

`api/` (API layer + USE_MOCK), `mock/` (fake data, used only by api/), `types/` (shared types, e.g. `ui.ts`), `hooks/`, `context/`, `components/ui/{Buttons,Forms,Links}` and `components/layout`, `pages/public` and `pages/private/admin`, `routes/`, `utils/` (e.g. `buttonStyles.ts`, `positionOptions.ts` as temporary data).

## Environment notes

- VS Code must use the workspace TypeScript (4.9.5), set through `typescript.tsdk` in `.vscode/settings.json`. VS Code's bundled TS 6.x reports false errors on CRA's tsconfig and CSS imports.
- Line endings: LF everywhere (Windows to Linux sync). Prettier `endOfLine: "lf"` and `.gitattributes` enforce it.
- Prettier: `npm run format` / `npm run format:check` in `frontend/`. Config in `.prettierrc`.

## Roadmap

1 Setup and tooling, 2 Types and mock data, 3 API layer, 4 UI components, 5 Layouts, 6 Routing and mock AuthContext, 7 Public pages, 8 Auth pages, 9 User dashboard, 10 Admin dashboard, 11+ Backend.

## Current status

- Step 1 complete (setup, tooling, structure, Prettier, commits).
- Professor's request: a simple admin dashboard DESIGN with placeholders only (no real data, no auth). Subjects section done as placeholders: list, view, new, edit, delete. Built with `AdminLayout`, `PageHeader`, `LinkButton`, `BackLink`, `Button`, `TextField`, `SelectField`, `CheckboxField`, `SubjectForm`. Admin routes live in `routes/AppRouter.tsx`.
- Step 2 (types, mock data) and Step 3 (API layer) are postponed on purpose. Until then, pages use hard-coded placeholder values, and `POSITION_OPTIONS` is a temporary constant.
- Still to do for the dashboard: Pages section (same five screens), a real admin menu page, a catch-all not-found route.
- Next: public pages (Step 7), starting with a public layout and the static pages.
