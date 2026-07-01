import OverviewManager from "@/components/admin/OverviewManager";
import { getProjectOverview } from "@/lib/storage/project-content";

export const metadata = {
  title: "사업개요 관리",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const initialData = await getProjectOverview();
  return <OverviewManager initialData={initialData} />;
}
