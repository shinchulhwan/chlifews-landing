import type { Customer } from "@/lib/types/customer";
import type { InterestCustomer } from "@/lib/types/interest-customer";

export type Database = {
  public: {
    Tables: {
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
