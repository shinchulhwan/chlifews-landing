import PremiumManager from "@/components/admin/PremiumManager";
import { getProjectPremium } from "@/lib/storage/project-content";

export const metadata = {
  title: "프리미엄 / 미래가치 관리",
  robots: { index: false, follow: false },
};

export default async function AdminPremiumPage() {
  const initialData = await getProjectPremium();
  return <PremiumManager initialData={initialData} />;
}
