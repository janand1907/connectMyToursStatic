# Connect My Tours: production database runbook

Status: database/user and environment setup completed. A temporary SSH runner
was used for read-only inspection and disabled afterward. Production migration
is paused because the current deployed revision does not contain the approved
blog migration command or migration files. This document still does not
authorize first-admin creation, Git push, or deployment of new code.

Execution record, 2026-10-07: the dedicated database and user were created,
scoped to this site, and the manual backup completed (latest checkpoint
2026-10-07 16:22). The database password was rotated privately and entered only
in Hostinger. Permanent runtime variables were applied and current master
commit `40cfa127` was redeployed. No migrations or SQL schema changes ran.
Hostinger phpMyAdmin opened the dedicated database successfully and showed no
tables, confirming the database is ready for a separately approved migration.
The migration command was not run: `npm run blog:migrate` is absent from the
current deployed `master` package, and the deployed tree has no blog migration
files. No code was uploaded or changed on the server.

The approved release commit was later pushed, but Hostinger's build failed
before deployment with a missing `tailwindcss` module under its production-only
dependency install. The migration remains unrun; no retry or rollback command
was issued.

The dependency correction is now validated locally, committed as
`d67a0296281fa569eb49e66a5c16f6749f789f46`, pushed, and deployed successfully.
The approved migration attempt stopped before connecting because Hostinger's
SSH shell did not expose `npm`; using the Node 22 binary and active release
dependencies then showed that `server-only` and `mysql2` were not available to
the source-side runner. No schema change occurred and no destructive retry was
made. Migration remains pending until Hostinger provides a supported command
environment with the complete application dependencies. The local runner fix
also removes unnecessary `server-only` imports from the migration CLI's
dependency chain while preserving those guards for request-facing modules.

## Before requesting execution approval

- The reviewed release candidate is identified by a local Git commit but has not
  been pushed to `master`.
- An approved migration runner can execute that exact revision with private
  Hostinger environment values. Confirm this runner before any deployment.
- A dedicated database and database user exist in Hostinger.
- A current database backup has been created; restore remains the rollback
  procedure if a later approved migration requires it.
- Production image upload remains disabled.

## Database and user

Create the database and user in Hostinger hPanel's MySQL database section. Use
the Hostinger account prefix plus an unambiguous Connect My Tours blog suffix.
Keep the user dedicated to this database.

Grant only database-level application and migration privileges:

- `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- `CREATE`, `ALTER`, `INDEX`, `REFERENCES`
- `DROP` only for a future approved migration that needs it

Some shared-hosting interfaces expose only a database-wide privilege option. If
that is the only option, assign it only to the dedicated blog database and user.

## Private environment values

Configure the approved production runner with private values for the permanent
runtime variables in `CONNECTMYTOURS_PRODUCTION_ENV_CHECKLIST.md`. The runner
must use `NODE_ENV=production`, the exact approved `APP_ORIGIN`, and the
dedicated database credentials.

Never pass a password as a command-line argument. Do not use the
`--create-database` migration flag in production.

## Migration execution, after separate approval

From the approved runner, at the reviewed release-candidate revision, run:

```sh
npm run blog:migrate
```

The configuration gate validates the production origin, host, database name,
credentials, port, session secret, and upload limit before a connection opens.

Verify the `blog_schema_migrations` ledger and these tables:

- `admin_users`
- `admin_sessions`
- `blog_categories`
- `blog_posts`
- `blog_redirects`
- `audit_logs`
- `admin_login_attempts`
- `blog_schema_migrations`

Run the same command once more to confirm that it reports no pending migrations.

## First production administrator, after separate approval

Use the same approved runner and private provisioning values, then run:

```sh
npm run blog:create-admin
```

Use a strong unique password. Do not print, log, or store the password or hash
outside the approved password manager. Confirm the administrator exists, then
remove `BLOG_ADMIN_NAME`, `BLOG_ADMIN_EMAIL`, `BLOG_ADMIN_PASSWORD`, and
`BLOG_ADMIN_ROLE` from any persistent Hostinger environment configuration.

Verify the login only after the deployment is stable.

## Rollback limits

The migration ledger detects incomplete or changed migrations, but there is no
automatic down-migration command. If a migration or initial admin provisioning
fails, stop deployment, restore the verified database backup when appropriate,
disable the affected administrator if created, and record the final state before
retrying. Application rollback means redeploying the previous reviewed commit.
