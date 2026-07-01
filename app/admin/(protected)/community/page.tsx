import CommunityManager from "@/components/admin/CommunityManager";
import { getProjectCommunity } from "@/lib/storage/project-content";

export const metadata = {
  title: "단지 커뮤니티 관리",
  robots: { index: false, follow: false },
};

export default async function AdminCommunityPage() {
  const initialItems = await getProjectCommunity();
  return <CommunityManager initialItems={initialItems} />;
}
