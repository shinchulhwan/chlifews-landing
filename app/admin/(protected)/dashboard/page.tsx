import CustomerTable from "@/components/admin/CustomerTable";
import { ALL_SITES_TAB } from "@/lib/admin/site-tabs";
import { getAdminDashboardData } from "@/lib/actions/admin";

export const metadata = {
  title: "관리자 대시보드",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardData({ site_name: ALL_SITES_TAB });

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {result.message}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-10">
      <CustomerTable
        initialCustomers={result.data.customers}
        initialStats={result.data.stats}
        initialSiteTabs={result.data.siteTabs}
      />
    </main>
  );
}
