"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { departments } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserFormProps {
  user?: User;
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const isEdit = !!user;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role ?? "sales");
  const [departmentId, setDepartmentId] = useState(user ? String(user.departmentId) : "");
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("氏名を入力してください");
    if (name.length > 100) errs.push("氏名は100文字以内で入力してください");
    if (!email.trim()) errs.push("メールアドレスを入力してください");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.push("正しいメールアドレス形式で入力してください");
    }
    if (!isEdit && password.length < 8) {
      errs.push("パスワードは8文字以上で入力してください");
    }
    if (!departmentId) errs.push("部署を選択してください");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // mock: 実際にはAPIを呼ぶ
    console.log("Save user:", { name, email, password, role, departmentId });
    router.push("/users");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{isEdit ? "ユーザー編集" : "ユーザー登録"}</h1>

      {errors.length > 0 && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">氏名 *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">パスワード {isEdit ? "（変更する場合のみ）" : "*"}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isEdit ? 0 : 8}
            required={!isEdit}
            placeholder="8文字以上"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">ロール *</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as "sales" | "manager" | "admin")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="sales">営業</option>
            <option value="manager">上長</option>
            <option value="admin">管理者</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">部署 *</Label>
          <select
            id="department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">部署を選択</option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/users")}>
            キャンセル
          </Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </div>
  );
}
