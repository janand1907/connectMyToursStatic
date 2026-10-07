# Connect My Tours: release gate checklist

`master` is an auto-deploy branch. Do not push until every required gate is
checked and the required production actions have separate approval.

Current state: database/user, backup, private environment setup, and the
current-master redeploy are complete. A temporary SSH inspection runner was
disabled. Migration approval exists, but execution is paused until the reviewed
blog release is deployed or an approved runner contains its migration command.

The first reviewed blog release was pushed to `master`, but Hostinger build
failed before deployment because `tailwindcss` was not installed in the
production dependency set. The previous revision remains active; migration and
admin gates are blocked until a corrected release is separately approved.

The corrected release places Tailwind, PostCSS, and Autoprefixer in production
dependencies. Commit `d67a0296` was pushed and Hostinger reports the deployment
as completed/current. The approved migration attempt stopped before connecting
because the source-side CLI could not resolve `server-only` and `mysql2`; no
migration has been run. The local fix removes unnecessary Next-only guards from
the CLI chain and retains both packages in runtime dependencies.

The full local blog harness now passes with the local MariaDB 13.0.2 binary via
`TEST_MYSQLD_PATH=/opt/homebrew/opt/mariadb/bin/mariadbd`. The harness uses an
isolated temporary datadir, loopback port, credentials, and cleanup. It does not
fall back to an existing database. MySQL 8.4.11 remains incompatible with this
macOS version because it crashes during isolated initialization.

The three approved pending commits were pushed to `master`, but Hostinger's
build of `530daef` failed before deployment in `app/layout.js` while loading
Google fonts through `next/font` (`@next/font` received a null response). The
previous live revision `d67a0296` remains active, so migration and admin gates
remain blocked.

The local font fix removes `next/font/google` from `app/layout.js` and supplies
CSS/system fallback stacks. Local build and integration checks pass; migration
remains pending until this corrected release is deployed successfully.

The corrected font release `d42810e` is deployed/current and public
pre-migration smoke checks passed. Migration remains blocked because the
source-side Hostinger runner cannot resolve `@next/env`; temporary SSH access
was disabled after the failed attempt.

The local fix removes `@next/env` from the migration CLI path. Production
configuration remains process-environment only and is still validated before
any database connection.

Database/user creation, backup completion, and private runtime-variable
application are complete. Applying the variables redeployed master commit
`40cfa127`; the corrected blog release is now current. No production schema
change or admin provisioning has occurred.

## Before production setup approval

- [ ] Local release candidate reviewed and tests, lint, build, and diff check pass.
- [ ] Production-gated MySQL configuration reviewed.
- [ ] Hostinger Node application is confirmed to build with `npm run build` and
      run with `npm run start`.
- [ ] Controlled migration runner approved.
- [ ] Short maintenance window scheduled or an equivalent monitoring plan agreed.

## Before migration approval

- [ ] Dedicated database and user created.
- [ ] User is scoped only to the blog database with required privileges.
- [x] Restorable database backup verified.
- [x] Private runtime environment values entered in Hostinger.
- [x] Production uploads remain disabled.

## Before pushing `master`

- [ ] Migrations completed from the reviewed release candidate.
- [ ] `blog_schema_migrations` and all eight expected tables verified.
- [ ] Idempotent migration rerun verified.
- [ ] First production administrator created and provisioning-only values removed.
- [ ] Reviewed release candidate committed locally.
- [ ] Deployment logs and smoke-test operator are ready.

## Live smoke test

- [ ] Homepage, About, Contact/Enquiry, and package/service pages load.
- [ ] `/blog`, a public category, and a published article load.
- [ ] Draft, archived, and inactive-category article URLs return 404.
- [ ] Changed published slug redirects only to its public canonical article.
- [ ] `/sitemap.xml` contains only eligible blog URLs.
- [ ] `/admin/login`, sign-in, dashboard, logout, and logged-out protection work.
- [ ] Category and post lifecycle actions create audit records.
- [ ] Production image upload returns its disabled, safe response.
- [ ] Cookies are secure and HTTP-only; no debug output or environment data is
      exposed.

## Rollback decision

If smoke testing finds a release issue, stop further content changes, redeploy the
previous reviewed commit, restore the database backup when schema or data must be
reverted, remove or disable a newly created administrator if needed, then repeat
the smoke test. Document any manual database reconciliation because migrations
have no automatic rollback.

## 2026-10-07 release result

The `dfaa53a` push and Hostinger deployment succeeded, and existing public-page
smoke tests passed. The release stopped at the migration gate because the
deployed command could not resolve `mysql2/promise`; this occurred before any DB
connection. Production schema and data are unchanged, no admin exists, uploads
remain disabled, and temporary SSH access was removed. Do not retry migration
until the runtime dependency issue is corrected and approved.

## Standalone runner gate

- [ ] `dist/blog-migrate.cjs` was rebuilt from the reviewed migrations.
- [ ] The deployed runner executes without source-side `node_modules`.
- [ ] Invalid production configuration fails before any connection.
- [ ] Only `node dist/blog-migrate.cjs migrate` is run after approval.

The `9d2dbc9` deployment passed its build and public smoke gate, but migration
stopped at database authentication. Do not retry until the dedicated database
user credentials and host permissions are corrected privately.

The credential refresh/redeploy was completed on 2026-10-07, but the retry returned the same non-secret authentication failure. SSH access and its temporary key were revoked; migration, admin provisioning, and schema changes remain pending.
