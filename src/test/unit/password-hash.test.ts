import { hashPassword, verifyPassword } from "@/src/lib/password";

describe("UT-003: パスワードハッシュ化・照合", () => {
  it("ハッシュ化した結果が平文と異なること", async () => {
    const password = "mypassword123";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
  });

  it("同じ入力でもハッシュ結果が毎回異なること（salt）", async () => {
    const password = "mypassword123";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });

  it("正しいパスワードで照合するとtrueを返す", async () => {
    const password = "mypassword123";
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it("誤ったパスワードで照合するとfalseを返す", async () => {
    const password = "mypassword123";
    const hash = await hashPassword(password);
    const result = await verifyPassword("wrongpassword", hash);
    expect(result).toBe(false);
  });
});
