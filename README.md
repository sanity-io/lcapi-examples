# How to use the Sanity Live Content API in various frameworks

These examples are intended to demonstrate how the Live Content API (LCAPI) works, and interacts with data loading and invalidation.
They use `@sanity/client` alone. For some of these examples we deliver fully baked utils that you should use, for example Next.js 14, 15 & 16 projects on App Router should use:

```ts
import {createClient, defineLive} from 'next-sanity/live'

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'your-dataset',
  apiVersion: '2025-10-21',
  useCdn: true,
})

export const {sanityFetch, SanityLive} = defineLive({client})
```

instead of defining your own `sanityFetch` function and `SanityLive` component.

# Examples that are done

- [Astro](./astro/) – [https://lcapi-examples-astro.sanity.dev]
- [TanStack Start](./tanstack-start/) – [https://lcapi-examples-tanstack-start.sanity.dev]
- [SvelteKit](./sveltekit/) – [https://lcapi-examples-sveltekit.sanity.dev]
- [Nuxt](./nuxt/) – [https://lcapi-examples-nuxt.sanity.dev]
- [Next.js 14 Pages Router](./next-14/) – [https://lcapi-examples-next-14.sanity.dev]
- [Next.js 15 App Router](./next-15/) – [https://lcapi-examples-next-15.sanity.dev]
- [Next.js 16 with the 'use cache: remote' directive](./next-16) - [https://lcapi-examples-next-16.sanity.dev/]
- [Next.js with Enterprise grade revalidation efficiency](./next-enterprise/) - [https://lcapi-examples-next-enterprise.sanity.dev] – uses Next.js 16 and `'use cache'`, but doesn't require it, and the technique could be used in any framework that supports on-demand revalidation similar to ISR in Next.js on Vercel.

# TODO

- [React Router](./react-router/)
