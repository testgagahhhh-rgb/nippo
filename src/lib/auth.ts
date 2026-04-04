import type { User } from "@/src/types";

/**
 * Mock auth helper.
 * Returns a stub user for development until the real auth system is implemented.
 * Change the `role` field to test different role-based views.
 */
export function getCurrentUser(): User {
  return {
    id: 1,
    name: "山田太郎",
    email: "yamada@example.com",
    role: "sales",
    department: { id: 1, name: "東京営業部" },
  };
}
