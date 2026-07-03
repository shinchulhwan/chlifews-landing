import type { SiteStatus } from "@/types/site";

export type DeployProvider = "vercel" | "cloudflare" | "manual";

export type DeployStatus = "pending" | "building" | "ready" | "error" | "cancelled";

export type DeployConfig = {
  siteId: string;
  slug: string;
  domain?: string | null;
  provider?: DeployProvider;
  /** Vercel project name 등 외부 ID */
  externalProjectId?: string;
};

export type DeployResult = {
  success: boolean;
  message: string;
  status: DeployStatus;
  siteStatus?: SiteStatus;
  url?: string;
  externalProjectId?: string;
  /** 향후 DNS·인증 연동용 메타 */
  meta?: Record<string, unknown>;
};

export type DomainConfig = {
  siteId: string;
  domain: string;
  provider?: "vercel" | "cloudflare";
};

export type DomainVerificationResult = {
  success: boolean;
  message: string;
  verified: boolean;
  provider?: string;
};
