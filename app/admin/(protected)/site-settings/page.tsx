import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import { getSiteSettingsForAdmin } from "@/lib/site-settings/save-site-settings";

export const metadata = {
  title: "사이트 설정",
  robots: { index: false, follow: false },
};

export default async function AdminSiteSettingsPage() {
  const initialValues = await getSiteSettingsForAdmin();

  return <SiteSettingsManager initialValues={initialValues} />;
}
