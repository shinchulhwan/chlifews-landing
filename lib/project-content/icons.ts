import {
  Building2,
  Bus,
  Car,
  GraduationCap,
  MapPin,
  ShoppingBag,
  Train,
  TreePine,
  type LucideIcon,
} from "lucide-react";

export const LOCATION_ICON_OPTIONS = [
  { value: "MapPin", label: "위치" },
  { value: "Train", label: "교통/역" },
  { value: "Bus", label: "버스" },
  { value: "Car", label: "도로/주차" },
  { value: "ShoppingBag", label: "상권" },
  { value: "GraduationCap", label: "학군" },
  { value: "TreePine", label: "공원/녹지" },
  { value: "Building2", label: "개발/인프라" },
] as const;

const ICON_MAP: Record<string, LucideIcon> = {
  MapPin,
  Train,
  Bus,
  Car,
  ShoppingBag,
  GraduationCap,
  TreePine,
  Building2,
};

export function resolveLocationIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? MapPin;
}
