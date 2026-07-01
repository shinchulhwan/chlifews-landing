import LocationManager from "@/components/admin/LocationManager";
import { getProjectLocation } from "@/lib/storage/project-content";

export const metadata = {
  title: "입지환경 관리",
  robots: { index: false, follow: false },
};

export default async function AdminLocationPage() {
  const initialData = await getProjectLocation();
  return <LocationManager initialData={initialData} />;
}
