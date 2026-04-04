import { getCurrentUser } from "@/src/lib/auth";
import { getDepartments } from "@/src/lib/mockData";
import { UserForm } from "@/src/components/user/UserForm";

export default function NewUserPage() {
  const user = getCurrentUser();

  if (user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">アクセス権限がありません</h2>
        <p className="mt-2 text-sm text-gray-600">このページは管理者のみアクセスできます。</p>
      </div>
    );
  }

  const departments = getDepartments();

  return <UserForm mode="new" departments={departments} />;
}
