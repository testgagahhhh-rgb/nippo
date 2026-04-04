import type { Role } from "@/src/types/report";

export interface AuthUser {
  id: number;
  name: string;
  role: Role;
}

/**
 * 現在のログインユーザーを返すスタブ。
 * 認証基盤が整備されたら実装を差し替える。
 */
export function useAuth(): { user: AuthUser } {
  return {
    user: {
      id: 2,
      name: "田中部長",
      role: "manager",
    },
  };
}
