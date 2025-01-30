/**
 * Decode a JWT token and return the payload.
 *
 * @param token - The JWT token to decode.
 * @returns The payload of the JWT token.
 */
export function getTokenPayload(token: string) {
  const decoded = token.split('.')[1];
  const payload = atob(decoded);

  return JSON.parse(payload);
}
