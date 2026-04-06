"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { PaginationMeta } from "@/src/types";

interface PaginationProps {
  meta: PaginationMeta;
}

export function Pagination({ meta }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(meta.total / meta.per_page);

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page > 1) {
        params.set("page", String(page));
      } else {
        params.delete("page");
      }
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams],
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="ページネーション"
      className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-0"
    >
      <div className="text-sm text-gray-700">
        全 <span className="font-medium">{meta.total}</span> 件中{" "}
        <span className="font-medium">{(meta.page - 1) * meta.per_page + 1}</span>
        {" - "}
        <span className="font-medium">{Math.min(meta.page * meta.per_page, meta.total)}</span>{" "}
        件を表示
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => goToPage(meta.page - 1)}
          disabled={meta.page <= 1}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          前へ
        </button>
        <button
          type="button"
          onClick={() => goToPage(meta.page + 1)}
          disabled={meta.page >= totalPages}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          次へ
        </button>
      </div>
    </nav>
  );
}
