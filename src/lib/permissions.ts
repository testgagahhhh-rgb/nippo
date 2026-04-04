import type { Role } from "@/src/types";

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  sales: ["create_report"],
  manager: ["post_comment", "manage_customers"],
  admin: ["create_report", "post_comment", "manage_customers", "manage_users"],
};

/**
 * ユーザーが指定されたアクションの権限を持つかチェックする
 */
export function hasPermission(user: { role: Role }, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[user.role];
  return permissions.includes(action);
}
