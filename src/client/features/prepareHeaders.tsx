/**
 * Prepare the headers for the API requests for simple
 * non authenticated requests
 *
 * @param headers - The headers to be prepared
 * @returns The prepared headers
 */
export function prepareNonAuthHeaders(headers: Headers) {
  headers.set('Content-Type', 'application/json');
  return headers;
}
