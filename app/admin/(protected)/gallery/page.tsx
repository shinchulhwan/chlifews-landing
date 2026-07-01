import GalleryManager from "@/components/admin/GalleryManager";
import { getProjectGallery } from "@/lib/storage/project-content";

export const metadata = {
  title: "갤러리 관리",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const initialItems = await getProjectGallery();
  return <GalleryManager initialItems={initialItems} />;
}
