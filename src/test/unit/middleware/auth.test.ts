// @vitest-environment node
import { describe, it, expect } from "vitest";
import { hasPermission } from "@/src/lib/middleware/auth";
import type { AuthUser, Action } from "@/src/lib/middleware/auth";

function makeUser(role: AuthUser["role"]): AuthUser {
  return {
    id: 1,
    name: "テストユーザー",
    email: "test@example.com",
    role,
    departmentId: 1,
  };
}

describe("UT-006: hasPermission 権限チェック関数", () => {
  // ケース1: sales は create_report を実行できる
  it("sales は create_report を実行できる", () => {
    const user = makeUser("sales");
    const action: Action = "create_report";
    expect(hasPermission(user, action)).toBe(true);
  });

  // ケース2: manager は create_report を実行できない
  it("manager は create_report を実行できない", () => {
    const user = makeUser("manager");
    const action: Action = "create_report";
    expect(hasPermission(user, action)).toBe(false);
  });

  // ケース3: manager は post_comment を実行できる
  it("manager は post_comment を実行できる", () => {
    const user = makeUser("manager");
    const action: Action = "post_comment";
    expect(hasPermission(user, action)).toBe(true);
  });

  // ケース4: sales は post_comment を実行できない
  it("sales は post_comment を実行できない", () => {
    const user = makeUser("sales");
    const action: Action = "post_comment";
    expect(hasPermission(user, action)).toBe(false);
  });

  // ケース5: admin は manage_users を実行できる
  it("admin は manage_users を実行できる", () => {
    const user = makeUser("admin");
    const action: Action = "manage_users";
    expect(hasPermission(user, action)).toBe(true);
  });

  // ケース6: manager は manage_users を実行できない
  it("manager は manage_users を実行できない", () => {
    const user = makeUser("manager");
    const action: Action = "manage_users";
    expect(hasPermission(user, action)).toBe(false);
  });

  // ケース7: sales は manage_customers を実行できない
  it("sales は manage_customers を実行できない", () => {
    const user = makeUser("sales");
    const action: Action = "manage_customers";
    expect(hasPermission(user, action)).toBe(false);
  });

  // ケース8: manager は manage_customers を実行できる
  it("manager は manage_customers を実行できる", () => {
    const user = makeUser("manager");
    const action: Action = "manage_customers";
    expect(hasPermission(user, action)).toBe(true);
  });

  // admin は全アクションを実行できることを確認（追加確認）
  it("admin は post_comment を実行できる", () => {
    const user = makeUser("admin");
    expect(hasPermission(user, "post_comment")).toBe(true);
  });

  it("admin は manage_customers を実行できる", () => {
    const user = makeUser("admin");
    expect(hasPermission(user, "manage_customers")).toBe(true);
  });
});
