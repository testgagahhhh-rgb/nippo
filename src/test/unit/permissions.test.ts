import { describe, it, expect } from "vitest";
import { hasPermission } from "@/lib/permissions";

describe("UT-006 権限チェック関数", () => {
  it("salesはcreate_report可能", () => {
    expect(hasPermission({ role: "sales" }, "create_report")).toBe(true);
  });

  it("managerはcreate_report不可", () => {
    expect(hasPermission({ role: "manager" }, "create_report")).toBe(false);
  });

  it("managerはpost_comment可能", () => {
    expect(hasPermission({ role: "manager" }, "post_comment")).toBe(true);
  });

  it("salesはpost_comment不可", () => {
    expect(hasPermission({ role: "sales" }, "post_comment")).toBe(false);
  });

  it("adminはmanage_users可能", () => {
    expect(hasPermission({ role: "admin" }, "manage_users")).toBe(true);
  });

  it("managerはmanage_users不可", () => {
    expect(hasPermission({ role: "manager" }, "manage_users")).toBe(false);
  });

  it("salesはmanage_customers不可", () => {
    expect(hasPermission({ role: "sales" }, "manage_customers")).toBe(false);
  });

  it("managerはmanage_customers可能", () => {
    expect(hasPermission({ role: "manager" }, "manage_customers")).toBe(true);
  });
});
