import { hasPermission } from "@/src/lib/permissions";

describe("UT-006: 権限チェック", () => {
  it("sales → create_report: true", () => {
    expect(hasPermission({ role: "sales" }, "create_report")).toBe(true);
  });

  it("manager → create_report: false", () => {
    expect(hasPermission({ role: "manager" }, "create_report")).toBe(false);
  });

  it("manager → post_comment: true", () => {
    expect(hasPermission({ role: "manager" }, "post_comment")).toBe(true);
  });

  it("sales → post_comment: false", () => {
    expect(hasPermission({ role: "sales" }, "post_comment")).toBe(false);
  });

  it("admin → manage_users: true", () => {
    expect(hasPermission({ role: "admin" }, "manage_users")).toBe(true);
  });

  it("manager → manage_users: false", () => {
    expect(hasPermission({ role: "manager" }, "manage_users")).toBe(false);
  });

  it("sales → manage_customers: false", () => {
    expect(hasPermission({ role: "sales" }, "manage_customers")).toBe(false);
  });

  it("manager → manage_customers: true", () => {
    expect(hasPermission({ role: "manager" }, "manage_customers")).toBe(true);
  });
});
