/**
 * インメモリのトークンブラックリスト。
 * Cloud Run の複数インスタンス環境では Redis 等への移行を要検討。
 */
const blacklist = new Set<string>();

export function addToBlacklist(token: string): void {
  blacklist.add(token);
}

export function isBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
