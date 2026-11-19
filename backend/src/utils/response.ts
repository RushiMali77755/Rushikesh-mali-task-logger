/**
 * Standardized API response helpers.
 */

/**
 * Return a JSON success response.
 * @param data - The payload to include in the response
 * @param status - HTTP status code (default 200)
 */
export function success(data: any, status: number = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Return a JSON error response.
 * @param message - Error message
 * @param status - HTTP status code (default 400)
 */
export function error(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
