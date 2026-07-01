import type { Customer } from "@/lib/types/customer";
import type { InterestCustomer } from "@/lib/types/interest-customer";
import type { SiteSetting } from "@/lib/types/site-setting";
import type {
  LocationPoint,
  OverviewInfoCard,
} from "@/lib/types/project-content";

export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: SiteSetting;
        Insert: {
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_overview: {
        Row: {
          id: string;
          site_name: string;
          section_title: string;
          description: string;
          image_url: string | null;
          info_cards: OverviewInfoCard[];
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          section_title?: string;
          description?: string;
          image_url?: string | null;
          info_cards?: OverviewInfoCard[];
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          section_title?: string;
          description?: string;
          image_url?: string | null;
          info_cards?: OverviewInfoCard[];
          updated_at?: string;
        };
        Relationships: [];
      };
      project_premium: {
        Row: {
          id: string;
          site_name: string;
          record_kind: "section" | "card";
          sort_order: number;
          title: string;
          description: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          record_kind?: "section" | "card";
          sort_order?: number;
          title?: string;
          description?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          record_kind?: "section" | "card";
          sort_order?: number;
          title?: string;
          description?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_location: {
        Row: {
          id: string;
          site_name: string;
          section_title: string;
          main_image_url: string | null;
          points: LocationPoint[];
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          section_title?: string;
          main_image_url?: string | null;
          points?: LocationPoint[];
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          section_title?: string;
          main_image_url?: string | null;
          points?: LocationPoint[];
          updated_at?: string;
        };
        Relationships: [];
      };
      project_gallery: {
        Row: {
          id: string;
          site_name: string;
          sort_order: number;
          image_url: string;
          title: string;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          sort_order?: number;
          image_url?: string;
          title?: string;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          sort_order?: number;
          image_url?: string;
          title?: string;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_floorplans: {
        Row: {
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
        Insert: {
          id?: string;
          site_name?: string;
          sort_order?: number;
          type_name?: string;
          supply_area?: string;
          exclusive_area?: string;
          description?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          sort_order?: number;
          type_name?: string;
          supply_area?: string;
          exclusive_area?: string;
          description?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_community: {
        Row: {
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
        Insert: {
          id?: string;
          site_name?: string;
          sort_order?: number;
          title?: string;
          subtitle?: string;
          description?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          sort_order?: number;
          title?: string;
          subtitle?: string;
          description?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: {
          id?: number | string;
          name: string;
          phone: string;
          memo?: string | null;
          site_name?: string;
          status?: "pending" | "completed";
          created_at?: string;
        };
        Update: {
          id?: number | string;
          name?: string;
          phone?: string;
          memo?: string | null;
          site_name?: string;
          status?: "pending" | "completed";
          created_at?: string;
        };
        Relationships: [];
      };
      interest_customers: {
        Row: InterestCustomer;
        Insert: {
          id?: string;
          name: string;
          phone: string;
          type?: string | null;
          visit_date?: string | null;
          memo?: string | null;
          status?: "pending" | "completed";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          type?: string | null;
          visit_date?: string | null;
          memo?: string | null;
          status?: "pending" | "completed";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      register_customer: {
        Args: {
          p_name: string;
          p_phone: string;
          p_memo?: string | null;
          p_site_name?: string;
        };
        Returns: undefined;
      };
      complete_customer: {
        Args: { p_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
