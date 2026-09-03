# Next.js 14 Pages Router

Live Content API (LCAPI) revalidation for an ISR page on the Pages Router, with `@sanity/client` alone.

`next-sanity/live` does not cover this app. `defineLive` needs Server Functions and `next/cache`, which the Pages Router does not have, and every `next-sanity` release since 10 requires Next.js 15 or 16. Projects on the App Router should use `defineLive` instead of the code in this folder.

## How revalidation works

The Pages Router revalidates by path, not by tag. `src/sanity/revalidation.ts` lists each ISR page with the query it renders. `src/pages/api/revalidate-tags.ts` accepts `POST {"tags": string[]}`, fetches each listed page's current sync tags, and calls `res.revalidate(path)` for every page whose tags overlap the posted ones.

`resolveRevalidatedBy()` in `src/sanity/revalidation.ts` decides who calls that route.

When `SANITY_SYNC_TAG_INVALIDATE_FUNCTION` is set, or `VERCEL_ENV` is `production`, the `cache-invalidate` Sanity Function in `../studio/functions` posts the tags and then calls `done()`. `<SanityLive>` subscribes with `waitFor: 'function'`, so the browser refetches only after the page has been regenerated.

Otherwise the browser posts the tags itself when a live event overlaps the page's tags, waits for the route to respond, and then refetches.

`getStaticProps` also sets `revalidate: 3600` as a fallback for a missed event.

The route is unauthenticated so the browser and the function can both call it. Add a shared secret before you copy this pattern into production.

## Point the studio function at a deployment

1. Deploy the blueprint from `../studio`: `pnpm sanity blueprints deploy`.
2. Set the target: `pnpm sanity functions env add cache-invalidate NEXT_14_REVALIDATE_URL https://<your-deployment>/api/revalidate-tags`.
3. Set `SANITY_SYNC_TAG_INVALIDATE_FUNCTION=cache-invalidate` on that deployment, or rely on `VERCEL_ENV=production`.

The function always posts to the next-enterprise URL. `NEXT_14_REVALIDATE_URL` adds this app as a second target.

## Environment variables

| Variable                              | Where           | Effect                                                               |
| ------------------------------------- | --------------- | -------------------------------------------------------------------- |
| `SANITY_SYNC_TAG_INVALIDATE_FUNCTION` | this app        | Any value selects function mode. Copy `.env.local.example` to start. |
| `VERCEL_ENV`                          | set by Vercel   | `production` selects function mode.                                  |
| `NEXT_14_REVALIDATE_URL`              | studio function | Full URL of this app's `/api/revalidate-tags`.                       |
