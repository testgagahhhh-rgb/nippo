import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // 部署
  const tokyo = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "東京営業部" },
  });
  const osaka = await prisma.department.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "大阪営業部" },
  });

  // ユーザー
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "山田太郎",
      email: "yamada@example.com",
      passwordHash,
      role: "sales",
      departmentId: tokyo.id,
    },
  });
  await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "鈴木花子",
      email: "suzuki@example.com",
      passwordHash,
      role: "sales",
      departmentId: tokyo.id,
    },
  });
  await prisma.user.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "田中部長",
      email: "tanaka@example.com",
      passwordHash,
      role: "manager",
      departmentId: tokyo.id,
    },
  });
  await prisma.user.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: "佐藤部長",
      email: "sato@example.com",
      passwordHash,
      role: "manager",
      departmentId: osaka.id,
    },
  });
  await prisma.user.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      name: "管理者",
      email: "admin@example.com",
      passwordHash,
      role: "admin",
      departmentId: null,
    },
  });

  // 顧客
  await prisma.customer.upsert({
    where: { id: 10 },
    update: {},
    create: { id: 10, name: "顧客A", companyName: "株式会社ABC" },
  });
  await prisma.customer.upsert({
    where: { id: 11 },
    update: {},
    create: { id: 11, name: "顧客B", companyName: "有限会社XYZ" },
  });
  await prisma.customer.upsert({
    where: { id: 12 },
    update: {},
    create: {
      id: 12,
      name: "ABCホールディングス代表",
      companyName: "ABCホールディングス",
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
