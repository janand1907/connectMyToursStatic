# Connect My Tours blog: Phase 3 local review

Phase 3 adds the local public blog routes, visibility controls, SEO output, and
sitemap entries. No deployment, production database access, or production media
storage configuration is included.

## Review locally

1. Start the local app with `npm run dev`.
2. Sign in at `/admin/login` and create an active category and a published post.
3. Open `/blog` and confirm the post card appears.
4. Open `/blog/category/<category-slug>` and confirm the post appears there.
5. Open `/blog/<post-slug>` and confirm the article, category link, related guides,
   CTA, title, description, canonical, Open Graph data, Article schema, and
   Breadcrumb schema are present.
6. Change the post status to draft or archived and confirm its public URL returns
   404. Restore and republish it to make it public again.
7. Inactivate its category and confirm both the category and article URLs return
   404. Reactivate the category to restore public visibility.
8. Rename a published post slug and confirm the old slug redirects to the new URL.
9. Open `/sitemap.xml` and confirm it includes only public blog URLs.

## Current local media boundary

Featured images use the approved local storage adapter and are served publicly only
in local development after their path and file availability are checked. Production
image storage remains disabled until the Hostinger storage decision is approved.

## Commands verified

```sh
npm run blog:test
npm run lint
npm run build
```

## Completed local review

On 2026-10-07, local-only review content was created through the protected local
admin APIs. It includes an active `local-review-guides-*` category, two published
articles, one draft, one archived article, one inactive category with a previously
published article, one renamed published article for redirect review, and one
validated local PNG image.

The review confirmed:

- `/blog`, the active category page, and the published article returned 200.
- Draft, archived, inactive-category, and invalid media URLs returned 404.
- The old published slug returned a 308 permanent redirect to its current slug.
- The local image returned 200 only from its valid `/media/blog/<uuid>.png` path.
- The article emitted title, description, canonical, robots, Article schema, and
  Breadcrumb schema data.
- Raw Markdown HTML appeared as text, and the `javascript:` Markdown link was not
  emitted as a clickable link.
- The desktop layout showed the existing header/footer, category navigation, clean
  cards, readable article content, related guides, and the existing-style CTA.
- `/admin/login` remained free of the promotional popup.

The review records remain in the local database for follow-up inspection. They are
clearly marked `LOCAL REVIEW`; the private-state records remain draft, archived, or
under the inactive category.
