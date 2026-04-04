"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CustomerFormData } from "@/src/types";

type ValidationErrors = Partial<Record<keyof CustomerFormData, string>>;

type CustomerFormProps = {
  mode: "new" | "edit";
  initialData?: CustomerFormData;
  customerId?: string;
};

function validate(data: CustomerFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = "顧客名は必須です";
  } else if (data.name.length > 100) {
    errors.name = "顧客名は100文字以内で入力してください";
  }

  if (!data.company_name.trim()) {
    errors.company_name = "会社名は必須です";
  } else if (data.company_name.length > 200) {
    errors.company_name = "会社名は200文字以内で入力してください";
  }

  if (data.phone && !/^[\d-]+$/.test(data.phone)) {
    errors.phone = "電話番号は数字とハイフンのみ入力できます";
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "正しいメールアドレス形式で入力してください";
  }

  if (data.address && data.address.length > 500) {
    errors.address = "住所は500文字以内で入力してください";
  }

  return errors;
}

const emptyFormData: CustomerFormData = {
  name: "",
  company_name: "",
  phone: "",
  email: "",
  address: "",
};

export function CustomerForm({ mode, initialData, customerId }: CustomerFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CustomerFormData>(initialData ?? emptyFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const payload = mode === "edit" ? { id: customerId, ...formData } : formData;

    // eslint-disable-next-line no-console
    console.log(`[${mode === "new" ? "CREATE" : "UPDATE"}] Customer payload:`, payload);

    router.push("/customers");
  }

  function handleCancel() {
    router.push("/customers");
  }

  const title = mode === "new" ? "顧客を追加" : "顧客を編集";

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">{title}</h2>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            顧客名 <span className="text-red-500">*</span>
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
          <label htmlFor="company_name" className="mb-1 block text-sm font-medium text-gray-700">
            会社名 <span className="text-red-500">*</span>
          </label>
          <input
            id="company_name"
            name="company_name"
            type="text"
            value={formData.company_name}
            onChange={handleChange}
            maxLength={200}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            電話番号
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            メールアドレス
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
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
            住所
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
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
