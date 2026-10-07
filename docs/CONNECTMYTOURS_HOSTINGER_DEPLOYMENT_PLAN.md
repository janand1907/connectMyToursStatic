# Connect My Tours: Hostinger deployment plan

Status: controlled environment setup completed; migrations and first-admin
creation remain separately gated.

Execution status: the dedicated production database/user, backup checkpoint,
and runtime environment variables were configured in Hostinger. A temporary
SSH runner was enabled and then disabled after inspection. The existing
committed `master` revision remains deployed. Production migration is still
blocked because that revision has no `blog:migrate` script or blog migration
files; running local uncommitted code against production is not permitted.

Release-candidate update, 2026-10-07: commit `35753cf6` was pushed to `master`
as approved. Hostinger checked out that commit but the build failed before
deployment because `tailwindcss` was unavailable while installing production
dependencies. The previous working revision remains active. Migration was not
run and the failure requires a separate local dependency/build fix approval.

The local fix moves the Tailwind/PostCSS/Autoprefixer build dependencies into
`dependencies`. A production-only install simulation and local build passed.
Fix commit `d67a0296281fa569eb49e66a5c16f6749f789f46` was pushed to `master`
and Hostinger reports that deployment as completed/current.

The approved migration attempt stopped before any database change because the
SSH shell did not expose `npm`, and the deployed source did not have a local
dependency tree. Using Hostinger's Node 22 binary and active release tree still
could not resolve `server-only` or `mysql2` for the source-side CLI. The local
fix removes unnecessary Next-only `server-only` guards from the migration
dependency chain; `mysql2` and `server-only` remain runtime dependencies. No
migration or destructive retry was performed.

Execution record, 2026-10-07:

- A dedicated Connect My Tours blog database and database user were created in
  Hostinger and are listed only under this website.
- A manual full website/database backup completed; Hostinger shows the new
  checkpoint as the latest backup (2026-10-07 16:22).
- The dedicated database-user password was rotated privately and was not printed
  or stored in project files.
- Required permanent runtime variables were entered privately. Existing SMTP
  variables were retained; no provisioning-only admin variables were added.
- Applying the variables redeployed the existing current `master` commit
  `40cfa127` only. Local, uncommitted blog code was not deployed.
- Production uploads remain disabled; no usable `BLOG_UPLOAD_DIR` was set.

## Confirmed Hostinger settings

- Repository: `connectMyToursStatic`
- Watched branch: `master`
- Auto-deployment: enabled
- Framework: Next.js
- Node.js: 22.x
- Application root: `./`
- Last deployment: completed
- Site: running

A push to `master` will therefore start a production deployment. `master` is the
release branch until Hostinger is deliberately reconfigured. Develop and review
changes on non-release branches, then merge only after the gates below pass.

## Runtime compatibility

Node.js 22.x and a root directory of `./` are compatible with this project when
Hostinger runs the application with:

```sh
npm run build
npm run start
```

The blog uses Next.js App Router pages, Node.js route handlers, `mysql2`,
server-side sessions, and a dynamic sitemap. It requires a persistent Node.js
application process; a static-export deployment is not sufficient.

## Current production blockers

1. Production MySQL schema has not been migrated and the first administrator
   has not been created.
2. Hostinger's deployed runtime does not expose the complete dependency tree to
   the SSH command runner, so a supported migration execution method is still
   required.
3. Production environment values are configured privately in Hostinger.
4. The upload route and media reader are deliberately disabled when
   `NODE_ENV=production`. No durable Hostinger media storage has been approved.
5. The Phase 1–3 source changes are deployed in the current release, but the
   database gate remains incomplete.

## Migration ordering with auto-deploy

The migration runner must use the exact reviewed release candidate and complete
before that candidate is pushed to `master`. Otherwise Hostinger could publish
new dynamic blog and sitemap routes before their database tables exist.

Create a reviewed local release-candidate commit without pushing it, then use an
approved runner with that exact source revision and privately injected production
environment values to run migrations and create the first administrator. Only
after those checks pass may that same revision be pushed to `master`.

If Hostinger does not provide an approved terminal or one-time command facility,
stop at that gate. Choose and approve a controlled migration runner before any
push; do not use an arbitrary workstation or deploy first and hope to migrate
afterward. A short maintenance window is recommended for the migration, first
admin provisioning, deployment, and smoke-test sequence.

## Production database setup

In Hostinger hPanel, open the database section and:

1. Create a dedicated MySQL database named with the Hostinger account prefix and
   a clear blog suffix, such as `accountprefix_connectmytours_blog`.
2. Create a dedicated database user named with the same account prefix and blog
   purpose. Do not reuse an existing site or general-purpose user.
3. Assign the user only to this dedicated database. Grant the schema privileges
   required by the application and migrations: `SELECT`, `INSERT`, `UPDATE`,
   `DELETE`, `CREATE`, `ALTER`, `INDEX`, and `REFERENCES`. Add `DROP` only when
   a reviewed future migration requires it. If hPanel can grant only all
   database-level privileges, scope that grant to this one database and user;
   never grant global privileges.
4. Record the database host, port, database name, user, and password privately
   in Hostinger. Do not place values in Git, documentation, chat, or `.env` files
   that could be committed.
5. Take and verify a restorable database backup before running migrations.

The database already exists before migrations, so the production migration
command must never use `--create-database`.

## Production-gated configuration

The local production gate is implemented in `lib/blog/config.js` and covered by
the isolated test suite. It keeps these boundaries:

- `development` and `test` accept only loopback hosts and
  `connect_my_tours_blog_local` or `connect_my_tours_blog_test*` databases.
- Tests must continue to provide their own loopback-only environment and never
  inherit a production database configuration.
- `production` may use a non-loopback database only after `APP_ORIGIN` passes
  HTTPS and origin-only validation and exactly equals
  `https://www.connectmytours.com`.
- Production configuration must reject local/test database names and loopback
  database hosts, empty credentials, invalid ports, weak session secrets, and
  invalid upload-size settings.
- No database connection is attempted until all checks succeed.

This adds no production credentials and does not connect to a production
database. Production database provisioning remains a separate approved step.

## Production deployment gates

1. Confirm Hostinger uses `npm run build` and `npm run start` for the Node.js
   application.
2. Review the locally tested production-gated database configuration for release.
3. Create a reviewed local release-candidate commit without pushing it.
4. Create the dedicated production MySQL database and least-privilege user.
5. Take and verify a database backup before any migration.
6. Configure private production environment values in Hostinger and the approved
   migration runner.
7. Obtain explicit approval for the production migration run.
8. Run migrations once, verify the migration ledger and all tables, then confirm
   the runner is idempotent.
9. Obtain explicit approval and create the first production administrator.
10. Push the same reviewed release candidate to `master` only after every prior
    gate passes. This triggers Hostinger auto-deployment.
11. Smoke-test the existing site, blog visibility rules, sitemap, admin login,
    logout, and disabled-upload behavior.

## Production media decision

The first deployment must leave image uploads disabled. Do not choose a usable
`BLOG_UPLOAD_DIR` until Hostinger confirms a durable, writable, backed-up
directory outside the application release and public/build folders. A future
storage-adapter approval is required before enabling uploads.
