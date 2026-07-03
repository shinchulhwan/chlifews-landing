import type { DeployService } from "@/lib/deploy/deploy-service.interface";
import type { Site } from "@/types/site";
import type { DeployConfig, DeployResult, DomainConfig } from "@/types/deploy";

const STUB_MESSAGE = "Deploy 기능 준비중";

function stubResult(partial?: Partial<DeployResult>): DeployResult {
  return {
    success: false,
    message: STUB_MESSAGE,
    status: "pending",
    ...partial,
  };
}

/**
 * Stub — 실제 Vercel/Cloudflare API 미연동
 */
export class StubDeployService implements DeployService {
  async createProject(_site: Site): Promise<DeployResult> {
    return stubResult();
  }

  async deploy(_config: DeployConfig): Promise<DeployResult> {
    return stubResult();
  }

  async addDomain(_config: DomainConfig): Promise<DeployResult> {
    return stubResult();
  }

  async getDeployStatus(_siteId: string): Promise<DeployResult> {
    return stubResult();
  }
}

let deployServiceInstance: DeployService | null = null;

export function getDeployService(): DeployService {
  if (!deployServiceInstance) {
    deployServiceInstance = new StubDeployService();
  }
  return deployServiceInstance;
}

export function setDeployService(service: DeployService): void {
  deployServiceInstance = service;
}
