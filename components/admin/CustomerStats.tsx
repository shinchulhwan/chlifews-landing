import type { CustomerStats } from "@/lib/types/interest-customer";

type CustomerStatsCardsProps = {
  stats: CustomerStats;
};

const ITEMS: Array<{
  key: keyof CustomerStats;
  label: string;
}> = [
  { key: "total", label: "전체 고객" },
  { key: "today", label: "오늘 등록" },
  { key: "pending", label: "상담대기" },
  { key: "completed", label: "상담완료" },
];

export default function CustomerStatsCards({
  stats,
}: CustomerStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-navy/60">{item.label}</p>
          <p className="mt-2 text-2xl font-bold text-navy">{stats[item.key]}</p>
        </div>
      ))}
    </div>
  );
}
