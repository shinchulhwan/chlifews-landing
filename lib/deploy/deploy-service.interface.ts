import type { Site } from "@/types/site";
import type { DeployConfig, DeployResult, DomainConfig } from "@/types/deploy";

/**
 * 배포·도메인·DNS 연동 추상화
 * 향후 Vercel API / Cloudflare DNS / Search Console 연동 시 구현체 교체
 */
export interface DeployService {
  /** Vercel 등 외부 프로젝트 생성 */
  createProject(site: Site): Promise<DeployResult>;

  /** 빌드·배포 트리거 */
  deploy(config: DeployConfig): Promise<DeployResult>;

  /** 커스텀 도메인 연결 */
  addDomain(config: DomainConfig): Promise<DeployResult>;

  /** 배포 상태 조회 */
  getDeployStatus(siteId: string): Promise<DeployResult>;
}
