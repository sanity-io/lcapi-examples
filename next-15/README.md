# Next.js 15 App Router

Deployed at [https://lcapi-examples-next-15.sanity.dev](https://lcapi-examples-next-15.sanity.dev).

Data loading and live revalidation use `defineLive` from `next-sanity/live`, see [`src/sanity/live.ts`](./src/sanity/live.ts). `sanityFetch` tags every fetch with the Live Content API sync tags (prefixed `sanity:`) and `<SanityLive />` in [`src/app/layout.tsx`](./src/app/layout.tsx) revalidates those tags in the browser when content changes.

## Cache tags

`sanityFetch` from `next-sanity` fetches twice: once for the sync tags, once for the data. Both fetches use `next: {revalidate: false, tags}` in production. The data fetch is tagged with the `tags` option you pass (default `['sanity']`) plus one `sanity:<sync tag>` per sync tag the Live Content API returned, and the same list comes back as `tags` on the result. For the theme query in the layout that is `['theme', 'sanity:s1:aoHoSg']`.

Next.js records those tags on its data cache and on ISR pages. The wrapper in [`src/sanity/live.ts`](./src/sanity/live.ts) also passes the same list to `addCacheTag` from `@vercel/functions`, which attaches them to the Vercel CDN entry for the response (the `x-vercel-cache-tags` header). `addCacheTag` is a no-op outside the Vercel runtime, so you will not see the header from `next start`.

`/` is an ISR page and is served from the CDN, so its tags are what get purged. `/dynamic` renders per request and shows the visitor's user agent, so it is deliberately left without `Vercel-CDN-Cache-Control`. CDN-caching it would serve one visitor's user agent to the next and defeat the page's purpose. Its response still carries the tags, so adding a `Vercel-CDN-Cache-Control` header later makes it purgeable with no other change.

## Server-side revalidation

[`src/app/api/revalidate-tags/route.ts`](./src/app/api/revalidate-tags/route.ts) accepts `POST {"tags": ["<sync tag>", ...]}` and purges `sanity:<sync tag>` for each through two APIs:

- `revalidateTag` from `next/cache` marks the Next.js data cache and ISR pages stale.
- `invalidateByTag` from `@vercel/functions` marks CDN entries tagged by `addCacheTag` stale. It is called once with the whole array.

Both are stale-while-revalidate. The first request after a purge is served from cache with `x-vercel-cache: STALE` while a fresh render happens in the background. `dangerouslyDeleteByTag` is the hard-delete alternative and is left out on purpose. `updateTag` is not used because it does not exist in Next.js 15; `next/cache` in 15.5 exports `revalidateTag(tag)` with a single argument, and `updateTag` arrived in Next.js 16 (see [`../next-16`](../next-16/)).

The shared Sanity Function in [`../studio/functions/cache-invalidate`](../studio/functions/cache-invalidate/index.ts) posts to this route on every content change, so both caches stay fresh even when no browser has the page open. The route is unauthenticated to keep the demo small. Authenticate it before using this pattern in production, see the comment in the route file.

To observe a purge on the production deployment, publish a change in the Studio (or POST a sync tag to the route) and then request the page twice:

```sh
curl -sI https://lcapi-examples-next-15.sanity.dev/ | grep -iE 'x-vercel-cache|cache-control'
```

Expect `x-vercel-cache: STALE` on the first request after the purge and `HIT` once the background render has finished.

`next-sanity@11` is the newest release that supports Next.js 15, and its `<SanityLive />` does not expose the `waitFor="function"` prop that `next-sanity@13` on Next.js 16 does. The browser therefore revalidates on its own instead of waiting for the Sanity Function. See [`../next-enterprise`](../next-enterprise/) for the variant that defers to the function in production.

## Environment variables

The Next.js app needs none. The Sanity project ID and dataset are hardcoded in [`src/sanity/client.ts`](./src/sanity/client.ts).

The `cache-invalidate` Sanity Function reads one optional variable. It is set on the deployed function, not on the Next.js deployment:

- `REVALIDATE_URLS`. Comma-separated list of `/api/revalidate-tags` URLs to POST sync tags to. Entries are trimmed and empty entries are dropped. When unset or empty the function falls back to the next-enterprise and next-15 production URLs.

Set it after `sanity blueprints deploy` from the `studio` directory:

```sh
sanity functions env add cache-invalidate REVALIDATE_URLS "https://lcapi-examples-next-15.sanity.dev/api/revalidate-tags,https://example.com/api/revalidate-tags"
```

For local runs, prefix the command instead: `REVALIDATE_URLS=http://localhost:3000/api/revalidate-tags sanity functions dev`.

## Scripts

```sh
pnpm --filter next-15 dev
pnpm --filter next-15 build
pnpm --filter next-15 lint
```
