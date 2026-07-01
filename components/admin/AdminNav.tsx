"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FolderKanban,
  ImageIcon,
  Images,
  Landmark,
  LayoutGrid,
  MapPin,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "관심고객 관리", icon: Users },
  { href: "/admin/projects", label: "프로젝트 관리", icon: FolderKanban },
  { href: "/admin/site-settings", label: "사이트 설정", icon: Settings },
  { href: "/admin/seo", label: "SEO / 메타태그 관리", icon: Search },
  { href: "/admin/hero-background", label: "메인 배경 관리", icon: ImageIcon },
  { href: "/admin/overview", label: "사업개요", icon: Building2 },
  { href: "/admin/premium", label: "프리미엄", icon: Sparkles },
  { href: "/admin/location", label: "입지환경", icon: MapPin },
  { href: "/admin/gallery", label: "갤러리", icon: Images },
  { href: "/admin/community", label: "단지 커뮤니티", icon: Landmark },
  { href: "/admin/floorplans", label: "평면도", icon: LayoutGrid },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-navy/10 bg-white">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-gold text-navy"
                  : "border-transparent text-navy/60 hover:border-navy/20 hover:text-navy"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
