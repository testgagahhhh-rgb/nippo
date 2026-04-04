import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, getDb } from "@/src/lib/db";
import { login } from "@/src/services/auth";
import { verifyToken, generateToken } from "@/src/lib/jwt";
import {
  createReport,
  getReports,
  getReport,
  updateReport,
  submitReport,
  ReportAlreadyExistsError,
} from "@/src/services/reports";
import { createComment } from "@/src/services/comments";
import { getCustomers } from "@/src/services/customers";
import { createUser } from "@/src/services/users";
import { authenticateToken } from "@/src/lib/auth-middleware";

beforeEach(async () => {
  await resetDb();
});

// ============================================================
// IT-001: ログイン〜日報作成フロー
// ============================================================
describe("IT-001: ログイン〜日報作成フロー", () => {
  it("ログインしてトークンを取得し、日報を作成できる", async () => {
    // Arrange & Act: ログイン
    const loginResult = await login("yamada@example.com", "password123");
    expect(loginResult.success).toBe(true);
    if (!loginResult.success) return;

    // トークンからuserIdを取得
    const payload = await verifyToken(loginResult.token);
    expect(payload.userId).toBe(1);

    // 日報作成
    const report = createReport(payload.userId, {
      report_date: "2026-04-01",
      visit_records: [{ customer_id: 10, content: "新商品の提案", visited_at: "10:00" }],
      problem: "競合他社の価格が低い",
      plan: "来週再訪問予定",
    });

    // Assert
    expect(report.id).toBeDefined();
    expect(report.status).toBe("draft");

    // DBにレコードが存在すること
    const db = getDb();
    expect(db.daily_reports.find((r) => r.id === report.id)).toBeDefined();
    expect(db.visit_records.filter((vr) => vr.report_id === report.id)).toHaveLength(1);
  });
});

// ============================================================
// IT-002: 訪問記録の複数行挿入
// ============================================================
describe("IT-002: 訪問記録の複数行挿入", () => {
  it("訪問記録3件を含む日報を作成できる", () => {
    const report = createReport(1, {
      report_date: "2026-04-01",
      visit_records: [
        { customer_id: 10, content: "商談A", visited_at: "09:00" },
        { customer_id: 11, content: "商談B", visited_at: "11:00" },
        { customer_id: 12, content: "商談C", visited_at: "14:00" },
      ],
      problem: "特になし",
      plan: "フォローアップ",
    });

    const db = getDb();
    const records = db.visit_records.filter((vr) => vr.report_id === report.id);

    expect(records).toHaveLength(3);
    records.forEach((r) => {
      expect(r.report_id).toBe(report.id);
    });
  });
});

// ============================================================
// IT-003: 訪問記録の差分更新
// ============================================================
describe("IT-003: 訪問記録の差分更新", () => {
  it("既存レコードの更新・削除・新規追加が正しく行われる", () => {
    // 前提: 訪問記録2件を持つ下書き日報を作成
    const report = createReport(1, {
      report_date: "2026-04-01",
      visit_records: [
        { customer_id: 10, content: "商談A", visited_at: "09:00" },
        { customer_id: 11, content: "商談B", visited_at: "11:00" },
      ],
      problem: "課題",
      plan: "計画",
    });

    const db = getDb();
    const originalRecords = db.visit_records.filter((vr) => vr.report_id === report.id);
    const id101 = originalRecords[0].id;
    // originalRecords[1] は送信しない（削除扱い）

    // Act: ID:101の内容を更新、ID:102は送信しない（削除）、新規1件追加
    const updated = updateReport(report.id, 1, {
      visit_records: [
        { id: id101, customer_id: 10, content: "商談A（更新）", visited_at: "09:30" },
        { customer_id: 12, content: "新規商談C", visited_at: "15:00" },
      ],
    });

    expect(updated).not.toBeNull();

    // Assert
    const afterRecords = db.visit_records.filter((vr) => vr.report_id === report.id);
    expect(afterRecords).toHaveLength(2);

    // ID:101が更新されていること
    const updatedRecord = afterRecords.find((r) => r.id === id101);
    expect(updatedRecord).toBeDefined();
    expect(updatedRecord!.content).toBe("商談A（更新）");
    expect(updatedRecord!.visited_at).toBe("09:30");

    // ID:102が削除されていること
    const deletedRecord = afterRecords.find((r) => r.id === originalRecords[1].id);
    expect(deletedRecord).toBeUndefined();

    // 新規行が追加されていること
    const newRecord = afterRecords.find((r) => r.content === "新規商談C");
    expect(newRecord).toBeDefined();
    expect(newRecord!.customer_id).toBe(12);
  });
});

// ============================================================
// IT-004: 日報提出後のコメント投稿
// ============================================================
describe("IT-004: 日報提出後のコメント投稿", () => {
  it("提出済み日報にコメントを投稿し、取得時にコメントが含まれる", () => {
    // 日報作成
    const report = createReport(1, {
      report_date: "2026-04-01",
      visit_records: [{ customer_id: 10, content: "商談", visited_at: "10:00" }],
      problem: "課題あり",
      plan: "対応予定",
    });

    // 提出
    const submitted = submitReport(report.id, 1);
    expect(submitted).not.toBeNull();
    expect(submitted!.status).toBe("submitted");

    // マネージャー(id:3)がコメント投稿
    const comment = createComment(report.id, 3, {
      target_type: "problem",
      content: "この課題について詳しく教えてください",
    });
    expect(comment.id).toBeDefined();

    // 日報取得してコメントが含まれること
    const fetched = getReport(report.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.comments).toHaveLength(1);
    expect(fetched!.comments[0].content).toBe("この課題について詳しく教えてください");
    expect(fetched!.comments[0].target_type).toBe("problem");
  });
});

// ============================================================
// IT-005: ページネーション
// ============================================================
describe("IT-005: ページネーション", () => {
  beforeEach(() => {
    // 山田太郎(id:1)の日報25件を作成
    for (let i = 1; i <= 25; i++) {
      const day = String(i).padStart(2, "0");
      createReport(1, {
        report_date: `2026-04-${day}`,
        visit_records: [{ customer_id: 10, content: `商談${i}`, visited_at: "10:00" }],
        problem: `課題${i}`,
        plan: `計画${i}`,
      });
    }
  });

  it("1ページ目: 20件取得、total=25、page=1", () => {
    const result = getReports({ user_id: 1, page: 1, per_page: 20 });

    expect(result.data).toHaveLength(20);
    expect(result.meta.total).toBe(25);
    expect(result.meta.page).toBe(1);
  });

  it("2ページ目: 5件取得、page=2", () => {
    const result = getReports({ user_id: 1, page: 2, per_page: 20 });

    expect(result.data).toHaveLength(5);
    expect(result.meta.page).toBe(2);
  });
});

// ============================================================
// IT-006: 顧客検索
// ============================================================
describe("IT-006: 顧客検索", () => {
  it("ABCで検索すると株式会社ABCとABCホールディングスが含まれ、有限会社XYZは含まれない", () => {
    const result = getCustomers({ q: "ABC" });

    const companyNames = result.data.map((c) => c.company_name);
    expect(companyNames).toContain("株式会社ABC");
    expect(companyNames).toContain("ABCホールディングス");
    expect(companyNames).not.toContain("有限会社XYZ");
  });
});

// ============================================================
// IT-007: 同日重複日報のトランザクション整合性
// ============================================================
describe("IT-007: 同日重複日報のトランザクション整合性", () => {
  it("同じユーザー・同じ日付で2回作成すると2回目はエラー", () => {
    const input = {
      report_date: "2026-04-01",
      visit_records: [{ customer_id: 10, content: "商談", visited_at: "10:00" }],
      problem: "課題",
      plan: "計画",
    };

    // 1回目: 成功
    const report = createReport(1, input);
    expect(report.id).toBeDefined();

    // 2回目: エラー
    expect(() => createReport(1, input)).toThrow(ReportAlreadyExistsError);

    // DBに1件しかないこと
    const db = getDb();
    const reports = db.daily_reports.filter(
      (r) => r.user_id === 1 && r.report_date === "2026-04-01",
    );
    expect(reports).toHaveLength(1);
  });
});

// ============================================================
// IT-008: 認証ミドルウェアのトークン検証
// ============================================================
describe("IT-008: 認証ミドルウェアのトークン検証", () => {
  it("ヘッダーなし → エラー（401相当）", async () => {
    const result = await authenticateToken(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
    }
  });

  it("Bearer invalid → エラー", async () => {
    const result = await authenticateToken("Bearer invalid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
    }
  });

  it("署名改ざんトークン → エラー", async () => {
    const token = await generateToken(1);
    const tampered = token.slice(0, -5) + "XXXXX";
    const result = await authenticateToken(`Bearer ${tampered}`);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
    }
  });

  it("期限切れトークン → エラー", async () => {
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

  it("有効トークン → userId取得成功", async () => {
    const token = await generateToken(42);
    const result = await authenticateToken(`Bearer ${token}`);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userId).toBe(42);
    }
  });
});

// ============================================================
// IT-009: ユーザー作成後のログイン
// ============================================================
describe("IT-009: ユーザー作成後のログイン", () => {
  it("新規ユーザーを作成し、そのユーザーでログインできる", async () => {
    // ユーザー作成
    const newUser = await createUser({
      name: "新人",
      email: "new@example.com",
      password: "newpass123",
      role: "sales",
      department_id: 1,
    });
    expect(newUser.id).toBeDefined();

    // ログイン
    const loginResult = await login("new@example.com", "newpass123");
    expect(loginResult.success).toBe(true);
    if (loginResult.success) {
      expect(loginResult.user.name).toBe("新人");
    }
  });
});
