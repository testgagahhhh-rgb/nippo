import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 部署マスタ
  const dept1 = await prisma.department.create({
    data: { name: "東京営業部" },
  });
  const dept2 = await prisma.department.create({
    data: { name: "大阪営業部" },
  });

  // ユーザー（パスワードは全員 "password123" の bcrypt ハッシュ）
  const hashPassword = "$2b$10$dummyHashForSeedDataOnly000000000000000000000000000000";

  const admin = await prisma.user.create({
    data: {
      name: "管理者",
      email: "admin@example.com",
      passwordHash: hashPassword,
      role: "admin",
      departmentId: dept1.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "田中部長",
      email: "tanaka@example.com",
      passwordHash: hashPassword,
      role: "manager",
      departmentId: dept1.id,
    },
  });

  const sales1 = await prisma.user.create({
    data: {
      name: "山田太郎",
      email: "yamada@example.com",
      passwordHash: hashPassword,
      role: "sales",
      departmentId: dept1.id,
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      name: "佐藤花子",
      email: "sato@example.com",
      passwordHash: hashPassword,
      role: "sales",
      departmentId: dept2.id,
    },
  });

  // 顧客マスタ
  const customer1 = await prisma.customer.create({
    data: {
      name: "山田 一郎",
      companyName: "株式会社ABC",
      phone: "03-1234-5678",
      email: "yamada@abc.co.jp",
      address: "東京都千代田区丸の内1-1-1",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "鈴木 次郎",
      companyName: "合同会社DEF",
      phone: "06-9876-5432",
      email: "suzuki@def.co.jp",
      address: "大阪府大阪市北区梅田2-2-2",
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "高橋 三郎",
      companyName: "株式会社GHI",
      phone: "03-5555-1234",
      email: "takahashi@ghi.co.jp",
      address: "東京都新宿区西新宿3-3-3",
    },
  });

  // 日報（下書き）
  const report1 = await prisma.dailyReport.create({
    data: {
      userId: sales1.id,
      reportDate: new Date("2026-04-01"),
      status: "draft",
      problem: "ABC社担当者が来月異動予定。後任担当者への引き継ぎ方法を要検討。",
      plan: "・ABC社フォローアップ連絡\n・提案書の修正",
    },
  });

  // 訪問記録
  await prisma.visitRecord.create({
    data: {
      reportId: report1.id,
      customerId: customer1.id,
      content: "新製品の提案を実施。先方の反応は良好。",
      visitedAt: "10:00",
    },
  });

  await prisma.visitRecord.create({
    data: {
      reportId: report1.id,
      customerId: customer2.id,
      content: "契約更新の確認。来週再訪の約束。",
      visitedAt: "14:30",
    },
  });

  // 日報（提出済み）
  const report2 = await prisma.dailyReport.create({
    data: {
      userId: sales1.id,
      reportDate: new Date("2026-03-31"),
      status: "submitted",
      submittedAt: new Date("2026-03-31T18:30:00+09:00"),
      problem: "GHI社の予算が厳しい状況。値引き交渉の余地を確認したい。",
      plan: "・GHI社へ見積もり再提出\n・新規顧客リストの整理",
    },
  });

  await prisma.visitRecord.create({
    data: {
      reportId: report2.id,
      customerId: customer3.id,
      content: "見積もり提出。先方は社内検討に入る予定。",
      visitedAt: "11:00",
    },
  });

  // コメント
  await prisma.managerComment.create({
    data: {
      reportId: report2.id,
      userId: manager.id,
      targetType: "problem",
      content: "来週の会議で共有してください。",
    },
  });

  console.log("Seed data created successfully");
  console.log({
    departments: [dept1, dept2],
    users: [admin, manager, sales1, sales2],
    customers: [customer1, customer2, customer3],
    reports: [report1, report2],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
