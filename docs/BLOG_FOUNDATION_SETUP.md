# Blog foundation — Phase 1

Phase 1 added the MySQL data layer, authentication primitives, validation,
migrations, and image storage interfaces. Phase 2 adds local admin pages and HTTP
endpoints. Public blog pages and live deployment changes are still pending.

## Local-only safety boundary

- Database connections accept only `127.0.0.1`, `localhost`, or `::1`.
- Database names must be `connect_my_tours_blog_local`, `connect_my_tours_blog_test`,
  or `connect_my_tours_blog_test_` followed by up to 12 lowercase letters/numbers.
- Use a dedicated local database user. Do not tunnel a production database to a local port.
- Production Hostinger configuration needs separate approval. There is no remote-host
  override in Phase 1.
- Production filesystem uploads are disabled. The Hostinger persistent directory is
  still unconfirmed; `public/`, `public_html/`, `hbuilds/`, `.next/`, and `out/` are
  not accepted upload directories.
- Database connections initialize lazily. Building the existing site does not open a
  blog database connection or require blog secrets.

## Prerequisites

- A working local Node.js/npm installation and local MySQL 8.x server.
- Dependencies installed with `npm install`.
- A local MySQL account with permissions on the dedicated blog database. Migration
  permissions include table creation and alteration; a future production runtime
  account should receive only the permissions the app needs.

The schema uses InnoDB, utf8mb4, standard indexes/foreign keys, UUID identifiers,
UTC `DATETIME(3)` timestamps, and JSON fields. It avoids MySQL-8-only collation names.
It was verified against local MySQL 8.4. Hostinger's exact database version and
connection permissions must still be checked before production setup.

## Configure the private local environment

Add the blog variables from `.env.example` to your existing `.env.local`. Preserve
the existing SMTP settings. Do not overwrite the file or commit it.

| Variable | Local purpose |
| --- | --- |
| `MYSQL_HOST` | `127.0.0.1` for a dedicated local server |
| `MYSQL_PORT` | Your local server port, normally `3306` |
| `MYSQL_DATABASE` | `connect_my_tours_blog_local` |
| `MYSQL_USER` | Dedicated local blog database user |
| `MYSQL_PASSWORD` | That user's private local password |
| `APP_ORIGIN` | Exact browser origin, such as `http://localhost:3000` |
| `SESSION_SECRET` | At least 32 random bytes, encoded as hex or base64 |
| `BLOG_UPLOAD_DIR` | `.local/blog-uploads` for local development |
| `BLOG_UPLOAD_MAX_BYTES` | `5242880` (5 MiB maximum) |

Generate `SESSION_SECRET` in your own terminal with:

```sh
openssl rand -hex 32
```

Copy it directly into the private environment file. Never paste it into an issue,
chat, repository, or frontend environment variable. Changing this secret invalidates
existing session tokens. Use the same secret across future instances of one app.

No blog secret uses a `NEXT_PUBLIC_` prefix. Placeholder secrets fail validation.
HTTP is accepted only for local origins; other origins require HTTPS.

## Run local migrations

If the local database already exists:

```sh
npm run blog:migrate
```

If your local user has permission to create the dedicated database:

```sh
npm run blog:migrate -- --create-database
```

These commands load the project's local environment using Next.js's environment
loader. They do not migrate during application startup or build.

The migrations create:

1. `admin_users`
2. `admin_sessions`
3. `blog_categories`
4. `blog_posts`
5. `blog_redirects`
6. `audit_logs`
7. `admin_login_attempts` (persistent login throttling)

The runner also creates `blog_schema_migrations`. It takes a MySQL advisory lock,
tracks checksums and completion state, and skips already applied migrations.
Each numbered SQL file contains one statement. Add new numbered migrations to
change the schema; do not edit recorded migration files.

### Failed or interrupted migrations

MySQL DDL implicitly commits. The runner records `running` before applying a file,
then `applied` or `failed`. It intentionally refuses to guess or retry an incomplete
migration automatically.

On a disposable local database, recreate the test database and rerun. On a database
containing work, take a backup, inspect the recorded migration and actual schema,
then reconcile them deliberately. Never blindly mark a migration applied or delete
a ledger row to bypass the check. Phase 1 provides no destructive rollback command.

## Create the first local admin

```sh
npm run blog:create-admin
```

Enter a name, email, and password. The password and confirmation are hidden. Passwords
must be at least 12 characters and at most 1024 bytes. The script creates an active
`admin`; each SEO teammate can receive a distinct account. Duplicate emails are
rejected without replacing the original account.

For a subsequent editor, set `BLOG_ADMIN_ROLE=editor` before invoking the command.
Trusted automation may supply `BLOG_ADMIN_NAME`, `BLOG_ADMIN_EMAIL`, and
`BLOG_ADMIN_PASSWORD` through its private process environment. Password arguments
are rejected. Do not write a literal password into a shell command or shell history.
The interactive prompt is preferred for manual setup.

Account creation does not open a login page: Phase 2 will add that UI. No permanent
development admin, password, or `.env.local` was created by the Phase 1 tests.

## Module boundaries and data conventions

- `lib/blog/db.js`: lazy pool, prepared statements, transactions.
- `lib/blog/migrations.js`: local migration runner and ledger.
- `lib/blog/categories.js`: category reads, validation, atomic writes/audits.
- `lib/blog/posts.js`: post reads, publication workflow, slug reservations/redirects.
- `lib/blog/admin-users.js`: trusted account setup/access changes; never expose it as
  a public registration endpoint.
- `lib/blog/sessions.js`: random opaque tokens, HMAC hashes, expiry and revocation.
- `lib/blog/audit.js`: structured audit events; allowlisted details omit secrets.
- `lib/blog/validation.js`: normalized form fields, URLs, statuses, IDs, schema JSON.
- `lib/auth/`: scrypt passwords, login/logout, throttling, roles, Next.js adapters.
- `lib/blog/uploads.js`: verifies and re-encodes images before storage.
- `lib/blog/storage/local.js`: explicit local filesystem adapter only.

Shared server modules use CommonJS so the Node setup/test commands and Next.js server
code can use the same implementations. The Next.js request adapter uses the existing
ES module style. Every sensitive module includes the `server-only` marker. CLI and
test commands use `--conditions=react-server` to allow trusted Node tools to load
these server modules; never apply that condition to browser builds.

Repository inputs use camelCase (`categoryId`, `featuredImage`, `metaTitle`, etc.).
Repository results use database snake_case and JavaScript Date objects. Map results
to an explicit serializable DTO before sending them to a future client component.
Never send account password hashes or raw database errors to a client.

`saveCategory` and `savePost` accept a complete form value, not a partial PATCH.
Optional fields omitted during updates are cleared/defaulted. Preserve the current
form values for status-only actions. `publishedAt` is preserved unless explicitly
replaced, and is set automatically when a post is first published.

Write repositories are trusted server primitives. Future handlers must authenticate
the request, authorize its role, and derive `actorId` from the verified session.
Do not accept `actorId` from submitted form data. Queries remain inside repositories.

### Publication rules

- Drafts can have empty content; published posts require content.
- Images are optional for every status.
- Categories must exist. Publishing requires an active category.
- Public helpers hide drafts, archived posts, and posts under inactive categories.
- Future publication dates are rejected; scheduling is not implemented.
- Slugs use lowercase letters, numbers, and single hyphens, up to 160 characters.
- Category and post slug namespaces are separate because categories will use
  `/blog/category/[categorySlug]`.
- Post slugs `category`, `page`, `feed`, and `rss` are reserved.
- SQL unique constraints handle concurrent duplicate submissions.
- Renaming a previously published article creates a 301 alias. Older aliases are
  updated to the latest slug so no redirect chains are created. Reserved aliases
  cannot be reused. Redirect reads return only publicly visible destinations.
- Category slug redirects are not part of this phase; establish category URLs
  before publishing and review changes to live category URLs in the public-page phase.

Allowed robots values are `index,follow`, `noindex,follow`, `index,nofollow`, and
`noindex,nofollow`. Canonical URLs must be full HTTP/HTTPS URLs without credentials
or fragments. Secondary keywords are an array of up to 20 strings. Custom schema is
JSON text representing an object with a schema.org context and a type or graph.

Content is stored as Markdown text. No renderer is introduced in Phase 1. Phase 3
must use a safe Markdown renderer with raw HTML disabled or sanitized and safe URL
protocols; never pass stored content directly to `dangerouslySetInnerHTML`.
Use `serializeJsonLd` to escape JSON-LD before embedding it into an HTML script.
Schema format validation does not verify the factual correctness of its contents.

## Authentication integration contract for Phase 2

- `login(credentials, { origin, metadata, previousToken })` validates origin,
  throttles attempts, verifies the password, rotates the old session if supplied,
  and writes the successful session and audit atomically.
- Passwords use salted scrypt (`N=32768, r=8, p=3`) with constant-time comparison.
- Session tokens contain 32 random bytes; only HMAC-SHA256 hashes are stored.
- Sessions expire after 8 hours; validation checks the current account status and role.
- Disabling/changing an account's access revokes its existing sessions.
- Cookie options are HttpOnly, SameSite=Strict, Path=/, and Secure for HTTPS. The
  HTTPS name uses the `__Host-` prefix. No cookie domain is set.
- `requireAdminPage` handles page authentication. `requireAdminMutation` checks
  origin and session for route mutations. Check every API/action, not only layouts.
- Login handlers must also verify origin through `login`; logout handlers must call
  `logout` before clearing the cookie. Both should accept POST only.
- Restrict account management to the `admin` role; `editor` can manage blog content.
- Login throttling allows 8 attempts per email per 15 minutes and 30 per trusted IP
  if provided. Attempts include successful logins. Buckets persist across processes.
- Do not trust forwarded IP headers until the hosting proxy configuration is known.
  Phase 1 records no IP by default; account throttling still applies.
- Future handlers must set request/body size limits, return safe validation errors,
  and avoid logging secrets or raw SQL errors. Admin responses should be no-store.
- `removeExpiredSessions` and `removeOldLoginAttempts` are available for later
  maintenance scheduling; no production scheduled job is created in this phase.

## Image adapter contract

`saveBlogImage({ filename, contentType, buffer }, storage)` calls the adapter's
`put({ filename, buffer, contentType, width, height })` after validation. It returns
only a relative `/media/blog/<uuid>.<extension>` URL and image metadata.

- Accept JPG/JPEG, PNG, WEBP only, up to 5 MiB and 25 megapixels.
- Require extension, supplied MIME type, and decoded image type to agree.
- Reject SVG, PHP, PHTML/PHAR, JavaScript, HTML, TXT, SQL, paths, and double extensions
  containing unsafe suffixes.
- Reject corrupt and animated/multipage images.
- Decode and re-encode using Sharp, stripping metadata and appended payloads.
- Generate UUID filenames; never persist the original filename or an absolute path.
- The local adapter offers `put`, `read`, and `remove`, rejects symlinked directories,
  and uses exclusive creation to avoid overwriting existing files.

The future upload endpoint must enforce authentication and a streaming/request size
limit **before** reading the whole request into memory. No upload/media HTTP endpoint
is exposed yet. Phase 2 must also check that selected media exists and define access
for draft-only images before exposing a public media route. The low-level storage
adapter is trusted; all uploads must go through `saveBlogImage`.

## Verification

```sh
npm run blog:test:unit
npm run blog:test
npm run lint
npm run build
```

`blog:test` starts a new MySQL instance with a temporary data directory and random
loopback port. It creates a temporary restricted user with a random password, runs
the real CLI migrations/admin setup and integration tests, then shuts down MySQL and
removes the directory. It never loads or uses the existing local database credentials.
Set `TEST_MYSQLD_PATH` if `mysqld` is not on PATH. No Docker or paid service is required.
An execution sandbox may need permission to launch MySQL and bind a loopback port.

Tests cover migrations/reruns/checksum failures, tables, unique constraints and
concurrent writes, CLI admin creation, password verification, login/logout, inactive
accounts, session expiry/revocation, roles, CSRF origin checks, throttling, image-free
publication, redirects, inactive categories, audit rollback/redaction, configuration
guards, unsafe uploads, re-encoding, and local storage paths.

## Later phases

Phase 2 adds the actual login and admin forms/endpoints, dashboard, category/post
management, and authenticated local uploads using these helpers. Phase 3 adds public
routes at `/blog`, `/blog/[postSlug]`, and `/blog/category/[categorySlug]`, with safe
content rendering, metadata, schemas, and sitemap updates.

Before production: confirm Hostinger runtime/database version and persistent image
storage, review dependency security advisories, establish proxy trust and backups,
and obtain separate approval for production credentials, migrations, and deployment.
Never push to an auto-deploy branch during local development without that approval.

### Dependency audit during Phase 1

The image-processing dependency was updated from Sharp 0.35.3 to 0.35.5 after its
security advisory appeared in the install audit. The new upload path also checks
image signatures before decoding.

The remaining npm audit result is 9 affected dependencies (8 high, 1 critical),
including the existing Next.js 14.2.35 installation and other pre-existing packages.
The added MySQL driver and server-only marker are not listed as vulnerable in this
audit. Resolve the applicable framework/runtime advisories before exposing the new
admin in production; the framework major-version upgrade is not part of Phase 1.
Audit counts can change as new advisories are published.
