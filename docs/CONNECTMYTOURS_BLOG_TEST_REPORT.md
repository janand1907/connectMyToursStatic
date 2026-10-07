# Connect My Tours blog: local verification report

Date: 2026-10-07
Scope: local Phase 1, Phase 2, and Phase 3 verification

## Environment and database

- Required blog environment variable names were present in the ignored
  `.env.local` file. No secret values were recorded in this report.
- The database host passed the loopback-only check.
- The database name passed the local-only validation as
  `connect_my_tours_blog_local`.
- The migration runner created and applied seven numbered migrations.
- A second migration run reported that the schema was up to date.
- All expected tables are present: `admin_users`, `admin_sessions`,
  `blog_categories`, `blog_posts`, `blog_redirects`, `audit_logs`,
  `admin_login_attempts`, and `blog_schema_migrations`.
- No production database was accessed.

## Automated checks

- `npm run blog:test`: passed.
  - Phase 1/configuration: 27 checks passed.
  - Phase 2 admin HTTP: 7 checks passed.
  - Phase 3 public-blog HTTP: 4 checks passed.
- `npm run lint`: passed with no warnings or errors.
- `npm run build`: passed; admin pages and APIs compile as dynamic Next.js routes.

## Production-gated database configuration

Hostinger deployment of commit `d67a0296` completed/current after the Tailwind
build-dependency fix. The approved production migration attempt stopped before
any database connection because the SSH runner lacked the complete dependency
tree (`server-only` and `mysql2` were unavailable to the source-side command).
No production tables, admin, or sample content were created. Temporary SSH
access was disabled and the current temporary key was removed. The local fix
removes unnecessary `server-only` imports from the migration CLI chain; both
`mysql2` and `server-only` are already declared in runtime dependencies.

The three pending commits were pushed to `master`, but Hostinger's build of
`530daef` failed before deployment in `app/layout.js` while loading Google fonts
through `next/font` (`@next/font` received a null response). The previous live
revision remains active. No migration, SSH runner setup, or production schema
change was attempted after the failed build.

The local font fix removes `next/font/google` from `app/layout.js` and adds
CSS/system font variables in `app/globals.css`. This eliminates the external
Google font fetch from the production build while preserving the existing
display/body font roles. Full isolated blog tests, lint, and build pass locally.

The local isolated MySQL harness was then reproduced independently. Homebrew
MySQL 8.4.11 on Apple Silicon/macOS 26.6.2 crashed with SIGSEGV during
`--initialize-insecure`. A local MariaDB 13.0.2 binary is now used through
`TEST_MYSQLD_PATH`; the harness uses MariaDB's isolated initializer and passes
the same loopback-only integration suite. Temporary data, socket, port, and
process cleanup completed, and no existing database or `.env.local` values were
used.

- Local/test execution remains limited to `127.0.0.1`, `localhost`, or `::1`
  and approved `connect_my_tours_blog_local` or
  `connect_my_tours_blog_test*` database names.
- Production configuration is accepted only with `NODE_ENV=production`, the
  exact HTTPS origin `https://www.connectmytours.com`, a non-loopback host, a
  non-local/test database identifier, non-empty MySQL credentials, a valid port,
  a strong session secret, and a valid upload-size limit.
- Invalid production configuration was verified to fail before the migration
  runner attempts a database connection.
- The isolated test harness now passes only a small allowlist of operating-system
  variables to its child processes, then supplies its own loopback database and
  generated test credentials. It cannot inherit production database settings.
- Production upload storage remains explicitly disabled. `BLOG_UPLOAD_DIR` is
  ignored in production until a durable storage adapter is separately approved.
- No production database, Hostinger setting, or production environment value was
  accessed or changed during verification.

The automated admin checks cover authentication/session handling, origin checks,
category lifecycle, post draft/publish/unpublish/archive/restore workflow, upload
validation, unsafe-file rejection, dashboard activity, audit logging, roles, slug
rules, canonical URL rules, robots values, and schema JSON validation.

## Manual local-route checks

- `/admin/login` returned HTTP 200 and contained the sign-in UI.
- An anonymous request to `/admin/blog` returned HTTP 307 with a redirect to
  `/admin/login`.
- The admin promo-popup gate excludes `/admin` and `/admin/*` paths.
- One active local `admin` account exists.
- A temporary server session for that active local account loaded the dashboard,
  created and edited a category, changed its active state, created and edited a
  draft post, published it, returned it to draft, archived it, restored it, and
  logged out. Each relevant request succeeded through the local admin APIs.
- After logout, the dashboard again redirected to `/admin/login`.
- The local audit-log count increased during the workflow.

## Remaining local verification

Complete. A local operator confirmed that the permanent local admin account signed
in successfully at `/admin/login`, loaded the dashboard, and signed out. The
password was not shared or recorded.

## Phase 3 public-blog checks

- `/blog`, `/blog/category/[categorySlug]`, and `/blog/[postSlug]` are dynamic
  public routes backed by the existing MySQL repositories.
- Published posts in active categories are visible. Drafts, archived posts, posts
  under inactive categories, inactive category pages, and unknown slugs return
  404 responses.
- Changed slugs for still-public posts return a permanent redirect to the current
  article URL. Redirects disappear when the destination is no longer public.
- Markdown is rendered as React text and links; raw HTML is not interpreted.
  Markdown links accept only relative, HTTP, or HTTPS destinations.
- Valid local media paths render only when the image exists in the local storage
  adapter. The public media reader is disabled in production until durable storage
  is separately approved.
- Article, Breadcrumb, Open Graph, canonical, robots, listing, category, and
  sitemap output are covered by the public HTTP tests.
- Sitemap output includes the blog index, public categories with published posts,
  and eligible published articles only. It excludes draft, archived, inactive,
  empty-category, and redirect alias URLs.

## Phase 3 manual local review

- Local-only review content was created through the protected local admin APIs:
  one active category, two published posts, one draft, one archived post, one
  inactive category containing a formerly published post, a changed-slug redirect,
  and one validated local image.
- `/blog`, the active category page, and the published article returned 200.
- Draft, archived, inactive-category, and invalid media URLs returned 404.
- The old public slug returned a 308 redirect to the current slug.
- Page source contained the expected metadata, canonical, robots, Article schema,
  and Breadcrumb schema values. The sitemap included the public article and
  excluded private/alias URLs.
- Desktop review confirmed header/footer integration, category navigation, cards,
  article readability, related guides, and CTA layout. The responsive Tailwind
  layout was also reviewed from the implemented breakpoint classes.
- The admin login route contained no promotional popup.

The local review records remain clearly marked `LOCAL REVIEW`. No production data
or storage was used.

## Production planning update

Production-gated configuration tests passed locally. Hostinger production setup
was then completed in a controlled window: the dedicated database/user exists,
the manual backup checkpoint completed, and required permanent runtime variables
were applied privately. Hostinger redeployed current master commit `40cfa127`;
the uncommitted blog work was not deployed. Existing SMTP variables were retained
and production uploads remain disabled.

No production migration, SQL schema change, or administrator creation was
performed. A temporary SSH runner confirmed the current deployed package lacks
`npm run blog:migrate` and the blog migration files; SSH was disabled and the
temporary local key was destroyed. The dedicated database remained empty through
Hostinger phpMyAdmin. Git was not committed or pushed. Existing live homepage,
contact/enquiry, and package pages remained reachable; no debug output was
observed. Blog smoke tests remain pending until the reviewed blog commit is
intentionally deployed.

The reviewed commit was subsequently pushed to `master`, but Hostinger's build
failed before deployment because `tailwindcss` was missing from the production
install. No migration, admin creation, retry, or manual SQL followed the
failure.

The correction moves `tailwindcss`, `postcss`, and `autoprefixer` into
production dependencies. Blog tests, lint, build, diff checks, and a disposable
production-only dependency install simulation pass. The correction remains
local and unpushed.
