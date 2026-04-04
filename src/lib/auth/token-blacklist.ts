/**
 * インメモリのトークンブラックリスト。
 * 本番環境では Redis や DB に移行すること。
 */
const blacklist = new Set<string>();

export function addToBlacklist(token: string): void {
  blacklist.add(token);
}

export function isBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
