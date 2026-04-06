/**
 * トークンブラックリスト（ログアウト済みトークンの管理）
 * 本番では Redis 等に置き換える。開発中はインメモリで管理。
 */
const blacklist = new Set<string>();

export function blacklistToken(token: string): void {
  blacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
