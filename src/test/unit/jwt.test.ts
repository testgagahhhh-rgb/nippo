import { generateToken, verifyToken } from "@/src/lib/jwt";

describe("UT-004: JWT生成・検証", () => {
  it("トークンが生成されること（文字列が返る）", async () => {
    const token = await generateToken(1);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    expect(token.split(".")).toHaveLength(3);
  });

  it("有効なトークンの検証でuserIdが正しく取得できる", async () => {
    const userId = 42;
    const token = await generateToken(userId);
    const payload = await verifyToken(token);
    expect(payload.userId).toBe(userId);
  });

  it("改ざんされたトークンの検証でエラーになる", async () => {
    const token = await generateToken(1);
    const tampered = token.slice(0, -5) + "XXXXX";
    await expect(verifyToken(tampered)).rejects.toThrow();
  });

  it("期限切れトークンの検証でエラーになる", async () => {
    vi.useFakeTimers();
    const token = await generateToken(1);

    // 2時間後に進める（有効期限は1時間）
    vi.advanceTimersByTime(2 * 60 * 60 * 1000);

    await expect(verifyToken(token)).rejects.toThrow("Token expired");

    vi.useRealTimers();
  });
});
