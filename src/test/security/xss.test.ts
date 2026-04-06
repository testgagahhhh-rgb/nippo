import { describe, it, expect } from "vitest";
import { escapeHtml, sanitizeObject, stripDangerousPatterns } from "@/lib/sanitize";

describe("XSS対策テスト", () => {
  describe("escapeHtml", () => {
    it("scriptタグをエスケープする", () => {
      const input = '<script>alert("XSS")</script>';
      const result = escapeHtml(input);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("</script>");
      expect(result).toBe("&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;");
    });

    it("imgタグのonerrorイベントをエスケープする", () => {
      const input = '<img src="x" onerror="alert(1)">';
      const result = escapeHtml(input);
      // HTMLタグとして機能しないようにエスケープされている
      expect(result).not.toContain("<img");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).toContain("&lt;img");
    });

    it("アンパサンド・引用符をエスケープする", () => {
      const input = "&\"'`/";
      const result = escapeHtml(input);
      expect(result).toBe("&amp;&quot;&#x27;&#96;&#x2F;");
    });

    it("通常のテキストはそのまま返す", () => {
      const input = "訪問内容: 新製品の提案を実施しました";
      expect(escapeHtml(input)).toBe(input);
    });

    it("空文字はそのまま返す", () => {
      expect(escapeHtml("")).toBe("");
    });

    it("javascript:プロトコル内の引用符をエスケープする", () => {
      const input = 'javascript:alert("XSS")';
      const result = escapeHtml(input);
      // 引用符がエスケープされることでスクリプト実行を防ぐ
      expect(result).not.toContain('"');
      expect(result).toContain("&quot;");
    });
  });

  describe("sanitizeObject", () => {
    it("オブジェクトの文字列プロパティをサニタイズする", () => {
      const input = {
        content: '<script>alert("XSS")</script>',
        problem: "問題なし",
        count: 42,
      };
      const result = sanitizeObject(input);
      expect(result.content).not.toContain("<script>");
      expect(result.problem).toBe("問題なし");
      expect(result.count).toBe(42);
    });

    it("ネストされたオブジェクトも再帰的にサニタイズする", () => {
      const input = {
        visit_records: [
          { content: "<img src=x onerror=alert(1)>", customer: { name: "正常<顧客>" } },
        ],
      };
      const result = sanitizeObject(input);
      expect(result.visit_records[0].content).not.toContain("<img");
      expect(result.visit_records[0].customer.name).toBe("正常&lt;顧客&gt;");
    });

    it("nullやundefinedはそのまま返す", () => {
      expect(sanitizeObject(null)).toBeNull();
      expect(sanitizeObject(undefined)).toBeUndefined();
    });
  });

  describe("stripDangerousPatterns", () => {
    it("scriptタグを除去する", () => {
      const input = '前文<script>alert("XSS")</script>後文';
      expect(stripDangerousPatterns(input)).toBe("前文後文");
    });

    it("イベントハンドラ属性を除去する", () => {
      const input = '<div onmouseover="alert(1)">test</div>';
      const result = stripDangerousPatterns(input);
      expect(result).not.toContain("onmouseover");
    });

    it("javascript:プロトコルを除去する", () => {
      const input = '<a href="javascript:alert(1)">click</a>';
      const result = stripDangerousPatterns(input);
      expect(result).not.toContain("javascript:");
    });

    it("通常のテキストはそのまま返す", () => {
      const input = "これは通常のテキストです。2026年4月の訪問記録。";
      expect(stripDangerousPatterns(input)).toBe(input);
    });
  });
});
