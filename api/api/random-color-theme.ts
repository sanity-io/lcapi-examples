/**
 * It's a bit annoying to handle tokens in 50 different apps and frameworks, so this edge API contains the logic for us in one place
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  return new Response(
    JSON.stringify({
      message: 'Hello, world!',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    },
  )
}
