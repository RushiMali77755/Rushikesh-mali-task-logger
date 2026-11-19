/**
 * CORS middleware for Astro.
 * Adds CORS headers to allow the Angular dev server at http://localhost:4200.
 */
import { defineMiddleware } from 'astro:middleware';

const ALLOWED_ORIGIN = 'http://localhost:4200';

export const onRequest = defineMiddleware(async ({ request }, next) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = await next();

  // Clone response to add CORS headers
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return newResponse;
});
