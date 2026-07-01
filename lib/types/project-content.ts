export type OverviewInfoCard = {
  id: string;
  label: string;
  value: string;
};

export type ProjectOverview = {
  id: string;
  site_name: string;
  section_title: string;
  description: string;
  image_url: string | null;
  info_cards: OverviewInfoCard[];
  updated_at: string;
};

export type ProjectPremiumSection = {
  id: string;
  site_name: string;
  section_title: string;
  section_description: string;
  updated_at: string;
};

export type ProjectPremiumCard = {
  id: string;
  site_name: string;
  sort_order: number;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectPremiumData = {
  section: ProjectPremiumSection;
  cards: ProjectPremiumCard[];
};

export type LocationPoint = {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
};

export type ProjectLocation = {
  id: string;
  site_name: string;
  section_title: string;
  main_image_url: string | null;
  points: LocationPoint[];
  updated_at: string;
};

export type ProjectGalleryItem = {
  id: string;
  site_name: string;
  sort_order: number;
  image_url: string;
  title: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectFloorplan = {
  id: string;
  site_name: string;
  sort_order: number;
  type_name: string;
  supply_area: string;
  exclusive_area: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectCommunityItem = {
  id: string;
  site_name: string;
  sort_order: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectContentSection =
  | "overview"
  | "premium"
  | "location"
  | "gallery"
  | "community"
  | "floorplans";

export const DEFAULT_OVERVIEW_INFO_CARDS: OverviewInfoCard[] = [
  { id: "1", label: "사업명", value: "" },
  { id: "2", label: "위치", value: "" },
  { id: "3", label: "규모", value: "" },
  { id: "4", label: "세대수", value: "" },
  { id: "5", label: "시공사", value: "" },
];
