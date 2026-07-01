import FloorplansManager from "@/components/admin/FloorplansManager";
import { getProjectFloorplans } from "@/lib/storage/project-content";

export const metadata = {
  title: "평면도 관리",
  robots: { index: false, follow: false },
};

export default async function AdminFloorplansPage() {
  const initialItems = await getProjectFloorplans();
  return <FloorplansManager initialItems={initialItems} />;
}
