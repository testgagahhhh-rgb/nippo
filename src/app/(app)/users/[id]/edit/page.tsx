import { notFound } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth";
import { getDepartments, getUserById } from "@/src/lib/mockData";
import { UserForm } from "@/src/components/user/UserForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: PageProps) {
  const currentUser = getCurrentUser();

  if (currentUser.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">アクセス権限がありません</h2>
        <p className="mt-2 text-sm text-gray-600">このページは管理者のみアクセスできます。</p>
      </div>
    );
  }

  const { id } = await params;
  const targetUser = getUserById(id);

  if (!targetUser) {
    notFound();
  }

  const departments = getDepartments();

  return (
    <UserForm
      mode="edit"
      userId={id}
      departments={departments}
      initialData={{
        name: targetUser.name,
        email: targetUser.email,
        password: "",
        role: targetUser.role,
        department_id: targetUser.department.id,
      }}
    />
  );
}
