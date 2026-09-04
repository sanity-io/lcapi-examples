# Next.js 14 Pages Router

Live Content API (LCAPI) revalidation for a CDN-cached page on the Pages Router, with `@sanity/client` and `@vercel/functions`.

`next-sanity/live` does not cover this app. `defineLive` needs Server Functions and `next/cache`, which the Pages Router does not have, and every `next-sanity` release since 10 requires Next.js 15 or 16. Projects on the App Router should use `defineLive` instead of the code in this folder.

## How revalidation works

`getServerSideProps` in `src/pages/index.tsx` fetches the page query with `filterResponse: false` to get its sync tags, then sets two headers on the response:

- `Vercel-Cache-Tag: sanity,sanity:<syncTag>,...`. The Vercel CDN indexes the cached response under these tags. The `sanity` tag is on every Sanity-backed response, so `vercel cache invalidate --tag sanity` purges them all.
- `Cache-Control: public, max-age=60, s-maxage=3600, stale-while-revalidate=60, stale-if-error=3600`. The CDN keeps the response for an hour, or until a tag is purged.

The `_next/data/<buildId>/index.json` route that client navigation fetches runs the same `getServerSideProps`, so it carries the same tags.

`src/pages/api/revalidate-tags.ts` accepts `POST {"tags": string[]}`, prefixes each tag with `sanity:`, and calls `invalidateByTag` from `@vercel/functions`. Invalidation marks the tagged responses stale. The next visitor gets the stale copy while the CDN revalidates in the background, which Vercel recommends over `dangerouslyDeleteByTag` because a deleted tag sends every concurrent request to the origin. Off Vercel the purge API has no request context, so the route logs the skip and responds with `purged: false`.

`<SanityLive>` in `src/sanity/live.tsx` refetches with `?lastLiveEventId=<event id>`. That query string is a new CDN cache key, so the live browser reaches `getServerSideProps` instead of the stale copy, and `@sanity/client` forwards it so the Sanity CDN returns content that includes the event.

`resolveRevalidatedBy()` in `src/sanity/revalidation.ts` decides who calls the route.

When `SANITY_SYNC_TAG_INVALIDATE_FUNCTION` is set, or `VERCEL_ENV` is `production`, the `cache-invalidate` Sanity Function in `../studio/functions` posts the tags and then calls `done()`. `<SanityLive>` subscribes with `waitFor: 'function'`, so the browser refetches only after the purge.

Otherwise the browser posts the tags itself when a live event overlaps the page's tags, waits for the route to respond, and then refetches.

The route is unauthenticated so the browser and the function can both call it. Add a shared secret before you copy this pattern into production.

## Cache tag limits

Vercel allows 256 UTF-8 bytes per tag and 128 tags per response, and a tag must not contain a comma. Sync tags look like `s1:aoHoSg`, so a page query would need more than 127 sync tags to exceed the limit. See [Purging Vercel CDN Cache](https://vercel.com/docs/caching/cdn-cache/purge).

## Point the studio function at a deployment

1. Deploy the blueprint from `../studio`: `pnpm sanity blueprints deploy`.
2. Set the target: `pnpm sanity functions env add cache-invalidate NEXT_14_REVALIDATE_URL https://<your-deployment>/api/revalidate-tags`.
3. Set `SANITY_SYNC_TAG_INVALIDATE_FUNCTION=cache-invalidate` on that deployment, or rely on `VERCEL_ENV=production`.

The function always posts to the next-enterprise URL. `NEXT_14_REVALIDATE_URL` adds this app as a second target.

## Environment variables

`@vercel/functions` needs no token or project id. It purges through the request context that the Vercel runtime injects into the function.

| Variable                              | Where           | Effect                                                               |
| ------------------------------------- | --------------- | -------------------------------------------------------------------- |
| `SANITY_SYNC_TAG_INVALIDATE_FUNCTION` | this app        | Any value selects function mode. Copy `.env.local.example` to start. |
| `VERCEL_ENV`                          | set by Vercel   | `production` selects function mode.                                  |
| `VERCEL`                              | set by Vercel   | Enables the CDN purge in `/api/revalidate-tags`.                     |
| `NEXT_14_REVALIDATE_URL`              | studio function | Full URL of this app's `/api/revalidate-tags`.                       |
