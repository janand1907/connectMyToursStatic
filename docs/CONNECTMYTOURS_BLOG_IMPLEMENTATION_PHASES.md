# Connect My Tours blog implementation phases

## Phase 1 — foundation

Status: complete in local source.

- MySQL migrations, repositories, validation, audit logging, password hashing,
  sessions, role checks, local upload adapter, and setup scripts are implemented.
- Database access is restricted to approved local/test names and loopback hosts.

## Phase 2 — protected blog admin

Status: complete and locally verified.

- Admin login/logout, dashboard, categories, posts, publishing lifecycle, SEO
  fields, local image validation, and protected admin endpoints are implemented.
- An active local admin account, dashboard session workflow, content lifecycle,
  audit records, and logout redirect were verified against the local database.
- A local operator confirmed the permanent local admin account can sign in, load
  the dashboard, and sign out without sharing the password.
- Production uploads remain disabled pending Hostinger storage confirmation.

## Phase 3 — public blog

Status: complete and locally verified.

Implemented work:

- `/blog`, `/blog/[postSlug]`, and `/blog/category/[categorySlug]`
- published/active-content queries and permanent redirects for eligible old slugs
- safe Markdown rendering with raw HTML rendered as text and unsafe URL protocols
  blocked
- metadata, canonical URLs, Open Graph, Article and Breadcrumb schema
- sitemap integration for eligible published URLs only
- responsive listing, category, article, empty-state, category navigation, related
  article, and CTA UI using the existing site components and Tailwind conventions

The public media route is local-development only. Production media storage remains
disabled pending a separately approved durable-storage decision.

Local manual review is complete. Review-only records remain in the local database
with `LOCAL REVIEW` labels for follow-up; private-state records are draft, archived,
or under an inactive category.

## Production preparation

Status: planning complete; pre-migration production environment setup complete.

The dedicated production database/user, backup checkpoint, and private runtime
environment setup were verified in Hostinger. A temporary SSH inspection runner
was enabled and disabled. Migration approval was granted, but execution is
paused because current master does not contain the blog migration command or
files. First admin creation, Git push, and new-code deployment remain gated.

Commit `35753cf6` was pushed to `master`, but Hostinger's build failed before
deployment because `tailwindcss` was unavailable under production-only npm
installation. The previous revision remains active; migration and admin
provisioning were not attempted.

The local dependency fix moves Tailwind, PostCSS, and Autoprefixer into runtime
dependencies required by the production build. Local tests, lint, build, and a
production-only install simulation pass. Commit `d67a0296` was pushed and
Hostinger reports it as completed/current.

The approved migration attempt stopped before connecting because the SSH runner
did not expose `npm`, and the active release dependency tree did not expose
`server-only` or `mysql2` to the source-side runner. The local fix removes
unnecessary Next-only guards from the migration dependency chain while retaining
runtime dependencies and production-gated configuration. Production migration
and first-admin creation remain pending; uploads remain disabled.

Hostinger database/user creation and the pre-migration backup are complete.
Applying runtime variables redeployed current master commit `40cfa127`; no local
uncommitted blog code was deployed.

- Hostinger has a running Next.js application on Node.js 22.x at root `./`.
  Its connected Git repository watches `master` with auto-deployment enabled.
  A push to `master` will deploy immediately.
- The Node.js version is compatible with this Next.js 14.2.35 project. The app
  still needs confirmed `npm run build` and `npm run start` settings and a
  persistent Node.js process.
- A local production gate now permits a non-loopback MySQL host only when
  `NODE_ENV=production`, the exact HTTPS `APP_ORIGIN` is
  `https://www.connectmytours.com`, and all database, session, and upload-limit
  checks pass. Development and test remain restricted to loopback local/test
  database names, and the isolated test harness does not inherit ambient
  credentials.
- Run reviewed production migrations only after explicit approval, then verify
  the ledger and all tables before first-admin provisioning.
- Keep production image upload and local-media serving disabled until durable
  Hostinger storage is confirmed and an approved storage adapter is available.
- The full deployment gate is documented in
  `docs/CONNECTMYTOURS_HOSTINGER_DEPLOYMENT_PLAN.md`.
- The production database runbook and release gate checklist are documented in
  `docs/CONNECTMYTOURS_PRODUCTION_DB_SETUP_RUNBOOK.md` and
  `docs/CONNECTMYTOURS_RELEASE_GATE_CHECKLIST.md`. They remain planning only.
