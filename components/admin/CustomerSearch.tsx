"use client";

import { useState } from "react";
import { Search, Phone } from "lucide-react";
import type { CustomerStatusFilter } from "@/lib/types/interest-customer";

type CustomerSearchProps = {
  onSearch: (params: {
    query: string;
    phone: string;
    status: CustomerStatusFilter;
  }) => void;
  isSearching?: boolean;
};

export default function CustomerSearch({
  onSearch,
  isSearching = false,
}: CustomerSearchProps) {
  const [query, setQuery] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<CustomerStatusFilter>("all");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({ query, phone, status });
  }

  function handleReset() {
    setQuery("");
    setPhone("");
    setStatus("all");
    onSearch({ query: "", phone: "", status: "all" });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto]">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-navy/60">
            <Search size={14} />
            통합 검색 (현장명, 이름, 연락처, 메모)
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어 입력"
            className="w-full rounded-xl border border-navy/10 bg-light-gray px-3 py-2.5 text-sm text-navy outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-navy/60">
            <Phone size={14} />
            전화번호 검색
          </span>
          <input
            type="search"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678 또는 숫자만"
            className="w-full rounded-xl border border-navy/10 bg-light-gray px-3 py-2.5 text-sm text-navy outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-navy/60">
            처리 상태
          </span>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as CustomerStatusFilter)
            }
            className="w-full rounded-xl border border-navy/10 bg-light-gray px-3 py-2.5 text-sm text-navy outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20 lg:min-w-[140px]"
          >
            <option value="all">전체</option>
            <option value="pending">대기</option>
            <option value="completed">완료</option>
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            검색
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-navy/10 px-5 py-2.5 text-sm font-medium text-navy/70 transition-colors hover:bg-light-gray"
          >
            초기화
          </button>
        </div>
      </div>
    </form>
  );
}
