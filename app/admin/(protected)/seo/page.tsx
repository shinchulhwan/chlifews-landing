import SeoMetaManager from "@/components/admin/SeoMetaManager";
import { getSeoMetaForAdmin } from "@/lib/seo-meta/save";

export const metadata = {
  title: "SEO / 메타태그 관리",
  robots: { index: false, follow: false },
};

export default async function AdminSeoMetaPage() {
  const initialValues = await getSeoMetaForAdmin();

  return <SeoMetaManager initialValues={initialValues} />;
}
