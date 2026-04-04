import { createReport, updateReport } from "@/src/services/reports";
import { getDb, resetDb } from "@/src/lib/db";
import { sanitizeInput } from "@/src/lib/sanitize";

describe("ST-NF-004: XSS対策テスト", () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe("scriptタグを含む訪問内容の保存", () => {
    it("訪問内容に<script>タグを含む日報を作成できる", () => {
      const xssContent = '<script>alert("XSS")</script>';
      const result = createReport(1, {
        report_date: "2026-04-04",
        visit_records: [{ customer_id: 10, content: xssContent, visited_at: "10:00" }],
        problem: "なし",
        plan: "なし",
      });

      expect(result.visit_records[0].content).toBe(xssContent);
    });

    it("保存されたデータに<script>タグが文字列としてそのまま格納されている", () => {
      const xssContent = "<script>alert('XSS')</script>";
      createReport(1, {
        report_date: "2026-04-04",
        visit_records: [{ customer_id: 10, content: xssContent, visited_at: "10:00" }],
        problem: "なし",
        plan: "なし",
      });

      const db = getDb();
      const record = db.visit_records[0];
      expect(record.content).toBe(xssContent);
      expect(record.content).toContain("<script>");
      expect(record.content).toContain("</script>");
    });
  });

  describe("HTML属性インジェクション", () => {
    it("onmouseoverイベントを含むデータも文字列のまま保存される", () => {
      const injectionContent = '" onmouseover="alert(1)';
      const result = createReport(1, {
        report_date: "2026-04-04",
        visit_records: [{ customer_id: 10, content: injectionContent, visited_at: "10:00" }],
        problem: "なし",
        plan: "なし",
      });

      expect(result.visit_records[0].content).toBe(injectionContent);

      const db = getDb();
      expect(db.visit_records[0].content).toBe(injectionContent);
    });

    it("imgタグのonerrorを含むデータも文字列のまま保存される", () => {
      const injectionContent = '<img src=x onerror="alert(1)">';
      const result = createReport(1, {
        report_date: "2026-04-04",
        visit_records: [{ customer_id: 10, content: injectionContent, visited_at: "10:00" }],
        problem: "なし",
        plan: "なし",
      });

      expect(result.visit_records[0].content).toBe(injectionContent);
    });
  });

  describe("日報更新時のXSSデータ", () => {
    it("updateReportでもscriptタグを含むデータが文字列として保存される", () => {
      const report = createReport(1, {
        report_date: "2026-04-04",
        visit_records: [{ customer_id: 10, content: "通常の内容", visited_at: "10:00" }],
        problem: "なし",
        plan: "なし",
      });

      const xssContent = "<script>document.cookie</script>";
      const updated = updateReport(report.id, 1, {
        visit_records: [
          {
            id: report.visit_records[0].id,
            customer_id: 10,
            content: xssContent,
            visited_at: "10:00",
          },
        ],
      });

      expect(updated).not.toBeNull();
      expect(updated!.visit_records[0].content).toBe(xssContent);
    });
  });

  describe("sanitizeInput関数", () => {
    it("通常の入力はそのまま返す", () => {
      expect(sanitizeInput("通常の入力")).toBe("通常の入力");
    });

    it("10000文字以下の入力はそのまま返す", () => {
      const input = "a".repeat(10000);
      expect(sanitizeInput(input)).toBe(input);
      expect(sanitizeInput(input).length).toBe(10000);
    });

    it("10000文字を超える入力はトリムされる", () => {
      const input = "a".repeat(15000);
      const result = sanitizeInput(input);
      expect(result.length).toBe(10000);
    });

    it("空文字列はそのまま返す", () => {
      expect(sanitizeInput("")).toBe("");
    });

    it("scriptタグを含む入力はそのまま返す（エスケープしない）", () => {
      const input = '<script>alert("XSS")</script>';
      expect(sanitizeInput(input)).toBe(input);
    });
  });
});
