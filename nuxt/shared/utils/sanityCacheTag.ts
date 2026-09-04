/**
 * Vercel CDN cache tag for a Sanity sync tag. The `sanity:` prefix matches
 * next-enterprise's `revalidateTag(\`sanity:${tag}\`)`, so the studio function's
 * payload maps to the same tags on both deployments.
 */
export function sanityCacheTag(syncTag: string) {
  return `sanity:${syncTag}`
}
