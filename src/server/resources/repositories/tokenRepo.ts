const TOKEN_MAP = new Set<string>();

/**
 * Function to add a token to the token map
 *
 * @param token - Token to be added
 */
export function addToken(token: string) {
  if (token && !TOKEN_MAP.has(token)) {
    TOKEN_MAP.add(token);
  }
}

/**
 * Function to delete a token from the token map
 *
 * @param token - Token to be deleted
 */
export function deleteToken(token: string) {
  if (TOKEN_MAP.has(token)) {
    TOKEN_MAP.delete(token);
  }
}

/**
 * Function to check if a token is valid
 *
 * @param token - Token to be checked
 * @returns - Boolean value if the token is valid
 */
export function isValidToken(token: string): boolean {
  return TOKEN_MAP.has(token);
}
