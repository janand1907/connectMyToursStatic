# Connect My Tours: production environment checklist

Status: names only. Store values privately in Hostinger; do not put production
secrets in Git, documentation, or local shared files.

Execution status: permanent runtime values were applied privately in Hostinger
and the existing current master revision was redeployed. Values are never
printed here.

Hostinger behavior verified on 2026-10-07: applying environment changes redeploys
the application. The approved redeploy used current master commit `40cfa127`.

## Blog runtime

- [x] `NODE_ENV` set to `production`
- [x] `MYSQL_HOST`
- [x] `MYSQL_PORT`
- [x] `MYSQL_DATABASE`
- [x] `MYSQL_USER`
- [x] `MYSQL_PASSWORD`
- [x] `APP_ORIGIN` set to the exact production origin
- [x] `SESSION_SECRET`
- [ ] `BLOG_UPLOAD_DIR` only when a future approved durable-storage adapter
      requires it
- [x] `BLOG_UPLOAD_MAX_BYTES`

`APP_ORIGIN` must be the HTTPS production origin, without a path, query string,
fragment, username, or password. The expected public site origin is
`https://www.connectmytours.com`.

Set no usable production upload directory for the first release. The current
upload and local-media routes remain disabled in production until durable storage
is approved. `BLOG_UPLOAD_DIR` is not required for the first release because the
production configuration explicitly uses disabled mode.

## Existing enquiry email

- [x] `SMTP_HOST`
- [x] `SMTP_PORT`
- [x] `SMTP_SECURE`
- [x] `SMTP_USER`
- [x] `SMTP_PASS`
- [x] `MAIL_TO`

## One-time administrator provisioning

Use these only while running the approved first-admin creation command. Remove
them after provisioning if Hostinger does not scope them to that command.

- [ ] `BLOG_ADMIN_NAME`
- [ ] `BLOG_ADMIN_EMAIL`
- [ ] `BLOG_ADMIN_PASSWORD`
- [ ] `BLOG_ADMIN_ROLE`

## Before applying values

- [x] The production-gated MySQL configuration code has been locally tested.
- [ ] The production-gated MySQL configuration code has been reviewed for
      release.
- [x] Production database and least-privilege user exist.
- [x] A current, restorable database backup exists.
- [ ] No local/test value is copied into production.
- [ ] `SESSION_SECRET` is a private random value of at least 32 bytes.
- [ ] No value uses a `NEXT_PUBLIC_` variable.
- [ ] Provisioning-only variables will be removed after first-admin creation.
