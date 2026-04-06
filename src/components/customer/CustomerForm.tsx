"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFormProps {
  customer?: Customer;
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const isEdit = !!customer;

  const [name, setName] = useState(customer?.name ?? "");
  const [companyName, setCompanyName] = useState(customer?.companyName ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("顧客名を入力してください");
    if (name.length > 100) errs.push("顧客名は100文字以内で入力してください");
    if (!companyName.trim()) errs.push("会社名を入力してください");
    if (companyName.length > 200) errs.push("会社名は200文字以内で入力してください");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.push("正しいメールアドレス形式で入力してください");
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // mock: 実際にはAPIを呼ぶ
    console.log("Save customer:", { name, companyName, phone, email, address });
    router.push("/customers");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{isEdit ? "顧客編集" : "顧客登録"}</h1>

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
          <Label htmlFor="name">顧客名 *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">会社名 *</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            maxLength={200}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">電話番号</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">住所</Label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/customers")}>
            キャンセル
          </Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </div>
  );
}
