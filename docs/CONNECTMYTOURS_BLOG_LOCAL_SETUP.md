# Connect My Tours blog: local setup

This guide applies only to the local checkout at
`/Users/anand/Projects/websites/TT/connectMyToursStatic`. It does not configure
Hostinger, a production database, or production uploads.

## Private environment

Keep the following values in the ignored `.env.local` file. Do not commit their
values or copy them to a browser-visible `NEXT_PUBLIC_` variable.

| Variable | Local requirement |
| --- | --- |
| `MYSQL_HOST` | `127.0.0.1`, `localhost`, or `::1` |
| `MYSQL_PORT` | Local MySQL port |
| `MYSQL_DATABASE` | `connect_my_tours_blog_local` |
| `MYSQL_USER` | Dedicated local MySQL user |
| `MYSQL_PASSWORD` | Private local MySQL password |
| `APP_ORIGIN` | Local app origin, such as `http://localhost:3000` |
| `SESSION_SECRET` | Random value of at least 32 bytes |
| `BLOG_UPLOAD_DIR` | Dedicated local directory outside the project/deployment folders |
| `BLOG_UPLOAD_MAX_BYTES` | Maximum `5242880` bytes |

The existing SMTP variables are unrelated to the blog setup. Do not change them
as part of blog work, and do not use the enquiry route for verification.

## Initialize the local database

Run the standard migration command:

```sh
npm run blog:migrate
```

If the dedicated local database does not exist and the local MySQL user is
permitted to create it, run:

```sh
npm run blog:migrate -- --create-database
```

Run `npm run blog:migrate` once more afterwards. It should report that the local
schema is up to date. The migration runner accepts only loopback hosts and the
approved local/test database-name pattern.

## Create the first local admin

Create the account interactively so the password never appears in shell history:

```sh
npm run blog:create-admin
```

The command asks for a name, email address, and hidden password. Use a password
of at least 12 characters. It creates an active `admin` account. Create later
editor accounts by setting `BLOG_ADMIN_ROLE=editor` in a private process
environment before using the same script.

## Run locally

```sh
npm run dev
```

Open `/admin/login` at the exact `APP_ORIGIN` value. After login, the dashboard is
at `/admin/blog`. Local image uploads are optional and remain local-only.

## Verification commands

```sh
npm run blog:test
npm run lint
npm run build
```

`blog:test` creates and removes its own isolated loopback MySQL instance. It does
not use the configured local blog database.
