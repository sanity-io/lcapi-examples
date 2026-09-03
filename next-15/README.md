# Next.js 15 App Router

Deployed at [https://lcapi-examples-next-15.sanity.dev](https://lcapi-examples-next-15.sanity.dev).

Data loading and live revalidation use `defineLive` from `next-sanity/live`, see [`src/sanity/live.ts`](./src/sanity/live.ts). `sanityFetch` tags every fetch with the Live Content API sync tags (prefixed `sanity:`) and `<SanityLive />` in [`src/app/layout.tsx`](./src/app/layout.tsx) revalidates those tags in the browser when content changes.

## Server-side revalidation

[`src/app/api/revalidate-tags/route.ts`](./src/app/api/revalidate-tags/route.ts) accepts `POST {"tags": ["<sync tag>", ...]}` and calls `revalidateTag('sanity:<sync tag>')` for each. The shared Sanity Function in [`../studio/functions/cache-invalidate`](../studio/functions/cache-invalidate/index.ts) posts to this route on every content change, so the Next.js data cache stays fresh even when no browser has the page open.

The route is unauthenticated to keep the demo small. Authenticate it before using this pattern in production, see the comment in the route file.

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
