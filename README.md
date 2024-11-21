# How to use the Sanity Live Content API in various frameworks

These examples are intended to demonstrate how the Live Content API (LCAPI) works, and interacts with data loading and invalidation.
They use `@sanity/client` alone. For some of these examples we deliver fully baked utils that you should use, for example Next.js 14 & 15 projects on App Router should use:

```ts
import {createClient, defineLive} from 'next-sanity'

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'your-dataset',
  apiVersion: '2024-01-17',
  useCdn: true,
})

export const {sanityFetch, SanityLive} = defineLive({client})
```

instead of defining your own `sanityFetch` function and `SanityLive` component.

# Examples that are done

- [TanStack Start](./tanstack-start/) – [https://lcapi-examples-tanstack-start.sanity.dev]
- [Next.js 15 canary with the 'use cache' directive](./next-canary) - [https://lcapi-examples-next-canary.sanity.dev/]

# TODO

- [Astro](./astro/)
- [Next.js 13 Pages Router](./next-13/)
- [Next.js 14 App Router](./next-14/)
- [Remix](./remix/)
- [Nuxt](./nuxt/)
- [SvelteKit](./sveltekit/)
- [Next.js with Enterprise grade revalidation efficiency](./next-enterprise/) - [https://lcapi-examples-next-enterprise.sanity.dev/] – uses Next.js 15's `use cache` directive, but doesn't require it, and the technique could be used in any framework that supports on-demand revalidation similar to ISR in Next.js on Vercel.
