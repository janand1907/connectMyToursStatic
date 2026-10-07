# Connect My Tours blog admin guide

This guide covers the local Phase 2 admin panel. Public blog pages and blog sitemap
integration are planned for Phase 3. Nothing here deploys to Hostinger.

## Local setup and sign in

Follow [BLOG_FOUNDATION_SETUP.md](./BLOG_FOUNDATION_SETUP.md) to configure the local
database, run migrations, and create your own admin account. Start the site with
`npm run dev` and open the exact origin in your private `APP_ORIGIN` setting.
Open `/admin/login`, enter your individual email and password, and sign in. The
dashboard is at `/admin/blog`. Sessions expire after eight hours. Repeated failed
logins are throttled; wait 15 minutes if you see a rate-limit message.

Use **Sign out** in the admin sidebar and the button on `/admin/logout` to end your
session. This revokes the server session and clears the browser cookie.

## Categories

Open **Categories** → **Add category**. Enter a name and unique slug. The form
suggests a slug from the name; use lowercase letters, numbers, and hyphens. Add a
description, meta title, and meta description if useful, choose active or inactive,
then save. Use **Edit** to revise the category. **Inactivate** hides it and its posts
from future public blog queries; **Activate** makes it available again.

Duplicate slugs receive a field error. Avoid changing a category slug after sharing
its public URL; category redirects are not implemented yet.

## Posts and publishing

Open **Posts** → **Add post**. Enter a title and unique slug, choose a category, and
write content in Markdown. An excerpt is optional. **Save draft** keeps unfinished
work; draft content may be empty. **Publish** requires nonempty content and an active
category. The first publication date is set automatically when left blank. Future
publication scheduling is not supported.

Use **Edit** on the posts list to change an article. Search by title or slug, or
filter by status/category. **Unpublish** changes a published article to draft.
**Archive** hides it. **Restore draft** recovers an archived article. The Status
field and **Save current status** save the full form in the selected state. Quick
status buttons on the list keep the article's other fields. Changing a previously
published post slug reserves its old slug for a future redirect.

Describe the service as travel coordination and guidance. Avoid claims of official
TTD agency or guaranteed darshan access; temple tickets, eligibility, and schedules
are governed by official authorities.

## SEO fields

- Set a **Meta title** and **Meta description** for search appearance.
- Add a **Focus keyword** and up to 20 comma-separated **Secondary keywords** for
  editorial planning.
- Leave **Canonical URL** blank to use the future article URL. If entered, it must
  be a full HTTP/HTTPS URL without credentials or a fragment.
- **Robots** defaults to `index,follow`. Use `noindex,follow` to request exclusion
  from search results while allowing links to be followed. The other supported
  choices are `index,nofollow` and `noindex,nofollow`.
- **OG title**, **OG description**, and **OG image** control sharing information.
  An OG image uses the relative path of an uploaded blog image. The form can copy
  the featured image path into this field.
- **Schema JSON** is optional. If used, enter a valid schema.org JSON object.
  Phase 3 adds standard Article and Breadcrumb schema automatically.

The server checks fields on every save. Errors appear beside the relevant field
and your entered text remains available for correction.

## Featured image

Featured images are optional. A post can be saved and published without one.
In local development, choose a JPG/JPEG, PNG, or WEBP file in the Image card.
The limit is **5 MiB and 25 megapixels**. The server checks extension, MIME type,
decoded format, and size, then re-encodes the image under a safe filename.

Do not upload SVG, PHP, JS, HTML, TXT, SQL, animated, corrupt, or disguised files.
The admin preview requires a valid session. **Remove from post** clears the image
field; it does not delete the local file. Production uploads remain disabled until
Hostinger's durable storage location is confirmed.

## Check your work

The dashboard, category list, and post list reflect saved changes. Public `/blog`
pages are not available yet. Phase 3 will add public article/category pages and
eligible URLs in `/sitemap.xml`.

If a post later fails to appear publicly, confirm it is published, has content,
and belongs to an active category. Drafts and archived posts stay hidden. If a
save fails locally, read the field error and confirm local MySQL is running.
