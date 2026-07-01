import HeroBackgroundManager from "@/components/admin/HeroBackgroundManager";
import { getHeroBackgroundUrl } from "@/lib/storage/site-settings";

export const metadata = {
  title: "메인 배경 관리",
  robots: { index: false, follow: false },
};

export default async function AdminHeroBackgroundPage() {
  const initialBackgroundUrl = await getHeroBackgroundUrl();

  return (
    <HeroBackgroundManager initialBackgroundUrl={initialBackgroundUrl} />
  );
}
