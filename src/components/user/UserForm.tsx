"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Department, Role, UserFormData } from "@/src/types";

type ValidationErrors = Partial<Record<keyof UserFormData, string>>;

type UserFormProps = {
  mode: "new" | "edit";
  initialData?: UserFormData;
  userId?: string;
  departments: Department[];
};

function validate(data: UserFormData, mode: "new" | "edit"): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = "氏名は必須です";
  } else if (data.name.length > 100) {
    errors.name = "氏名は100文字以内で入力してください";
  }

  if (!data.email.trim()) {
    errors.email = "メールアドレスは必須です";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "正しいメールアドレス形式で入力してください";
  }

  if (mode === "new" && !data.password) {
    errors.password = "パスワードは必須です";
  } else if (data.password && data.password.length < 8) {
    errors.password = "パスワードは8文字以上で入力してください";
  }

  if (!data.role) {
    errors.role = "ロールは必須です";
  }

  if (!data.department_id) {
    errors.department_id = "部署は必須です";
  }

  return errors;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "sales", label: "営業" },
  { value: "manager", label: "上長" },
  { value: "admin", label: "管理者" },
];

const emptyFormData: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "sales",
  department_id: 0,
};

export function UserForm({ mode, initialData, userId, departments }: UserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>(initialData ?? emptyFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "department_id" ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(formData, mode);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const payload = mode === "edit" ? { id: userId, ...formData } : formData;

    // eslint-disable-next-line no-console
    console.log(`[${mode === "new" ? "CREATE" : "UPDATE"}] User payload:`, payload);

    router.push("/users");
  }

  function handleCancel() {
    router.push("/users");
  }

  const title = mode === "new" ? "ユーザーを追加" : "ユーザーを編集";

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">{title}</h2>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            氏名 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            maxLength={100}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            パスワード {mode === "new" && <span className="text-red-500">*</span>}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete={mode === "new" ? "new-password" : "current-password"}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {mode === "edit" && (
            <p className="mt-1 text-xs text-gray-500">変更しない場合は空のままにしてください</p>
          )}
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
            ロール <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
        </div>

        <div>
          <label htmlFor="department_id" className="mb-1 block text-sm font-medium text-gray-700">
            部署 <span className="text-red-500">*</span>
          </label>
          <select
            id="department_id"
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value={0}>選択してください</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department_id && (
            <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            保存
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
