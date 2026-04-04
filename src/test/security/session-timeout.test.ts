import { generateToken } from "@/src/lib/jwt";
import { authenticateToken } from "@/src/lib/auth-middleware";
import { handleApiResponse } from "@/src/lib/api-client";

describe("ST-NF-003: セッションタイムアウトテスト", () => {
  describe("JWT有効期限の検証", () => {
    it("有効期限切れJWTで認証するとerror（status: 401）が返る", async () => {
      vi.useFakeTimers();
      const token = await generateToken(1);

      // 2時間後に進める（有効期限は1時間）
      vi.advanceTimersByTime(2 * 60 * 60 * 1000);

      const result = await authenticateToken(`Bearer ${token}`);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(401);
      }

      vi.useRealTimers();
    });

    it("有効なJWTで認証するとsuccess", async () => {
      const token = await generateToken(1);

      const result = await authenticateToken(`Bearer ${token}`);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.userId).toBe(1);
      }
    });

    it("改ざんJWTで認証するとerror（status: 401）が返る", async () => {
      const token = await generateToken(1);
      const tampered = token.slice(0, -5) + "XXXXX";

      const result = await authenticateToken(`Bearer ${tampered}`);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(401);
      }
    });
  });

  describe("認証ヘッダー不正", () => {
    it("認証ヘッダーがnullの場合はerror（status: 401）", async () => {
      const result = await authenticateToken(null);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(401);
      }
    });

    it("Bearer形式でないヘッダーはerror（status: 401）", async () => {
      const result = await authenticateToken("InvalidFormat token123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(401);
      }
    });
  });

  describe("セッション期限切れ時のリダイレクト", () => {
    let originalLocation: Location;

    beforeEach(() => {
      originalLocation = window.location;
      Object.defineProperty(window, "location", {
        value: { href: "http://localhost:3000/reports" },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });

    it("handleApiResponse(401)でwindow.location.hrefが/loginに設定される", () => {
      handleApiResponse(401);

      expect(window.location.href).toBe("/login");
    });

    it("handleApiResponse(200)ではリダイレクトしない", () => {
      handleApiResponse(200);

      expect(window.location.href).toBe("http://localhost:3000/reports");
    });

    it("handleApiResponse(403)ではリダイレクトしない", () => {
      handleApiResponse(403);

      expect(window.location.href).toBe("http://localhost:3000/reports");
    });
  });
});
