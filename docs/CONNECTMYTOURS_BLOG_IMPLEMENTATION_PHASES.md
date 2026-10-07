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

The three pending commits were pushed to `master`, but Hostinger's build of
`530daef` failed before deployment in `app/layout.js` while loading Google fonts
through `next/font`. The previous live revision remains active.

Commit `d42810e` is now deployed/current on Hostinger. Public pre-migration
smoke checks passed, but migration stopped before connection because the
source-side runner could not resolve `@next/env`. Production schema and admin
provisioning remain pending.

The local migration runner fix removes `@next/env` and unnecessary Next runtime
requirements from the CLI path. Production continues to use injected process
variables only; local dotenv loading is limited to non-production.

The local build fix removes the Google font import from `app/layout.js` and
defines CSS/system fallback stacks in `app/globals.css`. Local tests, lint, and
production build pass; production migration remains pending.

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

### 2026-10-07 controlled release stop

The `dfaa53a` release deployed successfully and existing-site smoke checks
passed. Production migration was stopped before DB connection because the
Hostinger runtime could not resolve `mysql2/promise`. No production schema,
admin, or upload state changed. Temporary SSH access was removed; a focused
runtime dependency fix is pending.

The migration execution plan now uses a committed standalone bundle,
`dist/blog-migrate.cjs`, so production migration does not depend on
Hostinger's source-side dependency layout. It is built with
`npm run blog:build-runner` and run as `node dist/blog-migrate.cjs migrate`.

The first standalone production attempt reached MySQL and was rejected by the
dedicated user's credentials. Production schema and admin provisioning remain
pending.

The subsequent private credential refresh and environment redeploy completed, but the standalone retry still failed at MySQL authentication. No production SQL ran, and temporary SSH access was removed. Resolve the Hostinger user password/host-permission mismatch before the next migration approval.
