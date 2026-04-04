"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type CustomerSearchBarProps = {
  defaultValue?: string;
};

export function CustomerSearchBar({ defaultValue }: CustomerSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(defaultValue ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (keyword.trim()) {
      params.set("q", keyword.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");

    router.push(`/customers?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <label htmlFor="customer-search" className="sr-only">
        検索キーワード
      </label>
      <input
        id="customer-search"
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="検索キーワード"
        className="block w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
      >
        検索
      </button>
    </form>
  );
}
