import type { User } from "@/src/types";

/** Mock auth stub — returns a hardcoded sales user */
export function getCurrentUser(): User {
  return {
    id: 1,
    name: "山田太郎",
    email: "yamada@example.com",
    role: "sales",
    department: { id: 1, name: "東京営業部" },
  };
}
