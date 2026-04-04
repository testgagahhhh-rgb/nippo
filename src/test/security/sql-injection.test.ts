import { getCustomers } from "@/src/services/customers";
import { login } from "@/src/services/auth";
import { createReport } from "@/src/services/reports";
import { getDb, resetDb } from "@/src/lib/db";

describe("ST-NF-005: SQLインジェクション対策テスト", () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe("顧客検索のSQLインジェクション", () => {
    it("' OR '1'='1 を入力しても全件返却されない", () => {
      const result = getCustomers({ q: "' OR '1'='1" });

      // インメモリDBはincludes()でフィルタしているため、
      // SQL文として解釈されず、部分一致しない限り空結果になる
      expect(result.data.length).toBe(0);
    });

    it("'; DROP TABLE customers; -- を入力してもエラーにならず空結果が返る", () => {
      const result = getCustomers({ q: "'; DROP TABLE customers; --" });

      expect(result.data.length).toBe(0);

      // テーブル（配列）が破壊されていないことを確認
      const db = getDb();
      expect(db.customers.length).toBeGreaterThan(0);
    });

    it("UNION SELECTインジェクションでもエラーにならない", () => {
      const result = getCustomers({ q: "' UNION SELECT * FROM users --" });

      expect(result.data.length).toBe(0);
    });

    it("正常な検索クエリは期待通り動作する", () => {
      const result = getCustomers({ q: "ABC" });

      // 「株式会社ABC」と「ABCホールディングス」がマッチする
      expect(result.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("ログインのSQLインジェクション", () => {
    it("admin'-- をメールアドレスに入力してもログイン失敗する", async () => {
      const result = await login("admin'--", "password123");

      expect(result.success).toBe(false);
    });

    it("' OR '1'='1 をメールアドレスに入力してもログイン失敗する", async () => {
      const result = await login("' OR '1'='1", "password123");

      expect(result.success).toBe(false);
    });

    it("SQLインジェクションをパスワードに入力してもログイン失敗する", async () => {
      const result = await login("admin@example.com", "' OR '1'='1");

      expect(result.success).toBe(false);
    });

    it("正常なログインは成功する", async () => {
      const result = await login("yamada@example.com", "password123");

      expect(result.success).toBe(true);
    });
  });

  describe("日報作成のSQLインジェクション", () => {
    it("SQL文を含むcontentが正常に保存され文字列として扱われる", () => {
      const sqlContent = "'; DROP TABLE daily_reports; --";
      const result = createReport(1, {
        report_date: "2026-04-04",
        visit_records: [{ customer_id: 10, content: sqlContent, visited_at: "10:00" }],
        problem: "SELECT * FROM users",
        plan: "DELETE FROM customers WHERE 1=1",
      });

      expect(result.visit_records[0].content).toBe(sqlContent);
      expect(result.problem).toBe("SELECT * FROM users");
      expect(result.plan).toBe("DELETE FROM customers WHERE 1=1");

      // データが破壊されていないことを確認
      const db = getDb();
      expect(db.customers.length).toBeGreaterThan(0);
      expect(db.users.length).toBeGreaterThan(0);
    });
  });

  describe("インメモリDBの安全性確認", () => {
    it("getCustomersはJavaScriptのArray.filterを使っておりSQL文を実行しない", () => {
      // 全件取得前の件数
      const before = getCustomers();
      const totalBefore = before.meta.total;

      // 悪意のあるクエリを実行
      getCustomers({ q: "'; DELETE FROM customers; --" });

      // 件数が変わっていないことを確認
      const after = getCustomers();
      expect(after.meta.total).toBe(totalBefore);
    });

    it("loginはArray.findで完全一致検索しておりSQL文を実行しない", async () => {
      const db = getDb();
      const usersBefore = db.users.length;

      // 悪意のあるクエリでログイン試行
      await login("'; DROP TABLE users; --", "password");

      expect(db.users.length).toBe(usersBefore);
    });
  });
});
