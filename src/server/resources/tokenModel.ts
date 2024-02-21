const TOKEN_MAP = new Set<string>();

export function addToken(token: string) {
  if (token && !TOKEN_MAP.has(token)) {
    TOKEN_MAP.add(token);
  }
}

export function deleteToken(token: string) {
  if (TOKEN_MAP.has(token)) {
    TOKEN_MAP.delete(token);
  }
}

export function isValidToken(token: string): boolean {
  return TOKEN_MAP.has(token);
}
