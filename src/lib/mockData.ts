import type { Customer, Report } from "@/src/types";

export function getCustomers(): Customer[] {
  return [
    { id: 1, name: "田中一郎", company_name: "株式会社アルファ" },
    { id: 2, name: "佐藤花子", company_name: "株式会社ベータ" },
    { id: 3, name: "鈴木次郎", company_name: "ガンマ工業株式会社" },
    { id: 4, name: "高橋美咲", company_name: "デルタ商事株式会社" },
    { id: 5, name: "伊藤健太", company_name: "イプシロン技研株式会社" },
    { id: 6, name: "渡辺由美", company_name: "ゼータソリューションズ株式会社" },
  ];
}

export function getReportById(id: string): Report | null {
  if (id === "1") {
    return {
      id: 1,
      report_date: "2026-04-03",
      status: "draft",
      submitted_at: null,
      user: { id: 1, name: "山田太郎" },
      visit_records: [
        {
          id: 101,
          customer: { id: 1, name: "田中一郎", company_name: "株式会社アルファ" },
          content: "新製品の提案を行い、サンプル品の送付を約束した。",
          visited_at: "10:00",
        },
        {
          id: 102,
          customer: { id: 3, name: "鈴木次郎", company_name: "ガンマ工業株式会社" },
          content: "既存契約の更新について打ち合わせ。来月中に回答予定。",
          visited_at: "14:30",
        },
      ],
      problem: "ガンマ工業の契約更新について、価格面での調整が必要。",
      plan: "アルファ社へサンプル品を発送。ガンマ工業向けの見積書を作成。",
      has_unread_comment: false,
      created_at: "2026-04-03T09:00:00+09:00",
      updated_at: "2026-04-03T17:00:00+09:00",
    };
  }
  return null;
}
