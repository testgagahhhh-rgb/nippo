import type { Role } from "@/types";

/**
 * アクション定義
 */
export type Action = "create_report" | "post_comment" | "manage_users" | "manage_customers";

/**
 * ロール別の許可アクションマッピング
 */
const rolePermissions: Record<Role, Action[]> = {
  sales: ["create_report"],
  manager: ["post_comment", "manage_customers"],
  admin: ["manage_users", "post_comment", "manage_customers"],
};

/**
 * ユーザーが指定のアクションを実行できるか判定する
 */
export function hasPermission(user: { role: Role }, action: Action): boolean {
  const permissions = rolePermissions[user.role];
  return permissions.includes(action);
}
