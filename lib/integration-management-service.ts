export interface Integration {
  id: string;
  companyId: string;
  integrationCode: string;
  integrationName: string;
  integrationType: 'api' | 'webhook' | 'database' | 'file' | 'service';
  externalSystem: string;
  status: 'active' | 'inactive' | 'error' | 'paused';
  lastSyncDate?: Date;
  createdAt: Date;
}

export interface APIEndpoint {
  id: string;
  integrationId: string;
  endpointCode: string;
  endpointName: string;
  endpointUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  authentication: 'none' | 'basic' | 'bearer' | 'api-key';
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: Date;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  logCode: string;
  logType: 'sync' | 'error' | 'warning' | 'info';
  message: string;
  status: 'success' | 'failed' | 'pending';
  createdAt: Date;
}

export interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  totalEndpoints: number;
  activeEndpoints: number;
  totalLogs: number;
  successfulSyncs: number;
  failedSyncs: number;
  integrationHealthScore: number;
}

export class IntegrationManagementService {
  private integrations: Map<string, Integration> = new Map();
  private endpoints: Map<string, APIEndpoint> = new Map();
  private logs: Map<string, IntegrationLog> = new Map();

  async createIntegration(
    companyId: string,
    integrationCode: string,
    integrationName: string,
    integrationType: 'api' | 'webhook' | 'database' | 'file' | 'service',
    externalSystem: string
  ): Promise<Integration> {
    const integration: Integration = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      integrationCode,
      integrationName,
      integrationType,
      externalSystem,
      status: 'active',
      createdAt: new Date(),
    };

    this.integrations.set(integration.id, integration);
    console.log(`Integration created: ${integrationName}`);
    return integration;
  }

  async createEndpoint(
    integrationId: string,
    endpointCode: string,
    endpointName: string,
    endpointUrl: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    authentication: 'none' | 'basic' | 'bearer' | 'api-key'
  ): Promise<APIEndpoint> {
    const endpoint: APIEndpoint = {
      id: Math.random().toString(36).substr(2, 9),
      integrationId,
      endpointCode,
      endpointName,
      endpointUrl,
      method,
      authentication,
      status: 'active',
      createdAt: new Date(),
    };

    this.endpoints.set(endpoint.id, endpoint);
    console.log(`Endpoint created: ${endpointName}`);
    return endpoint;
  }

  async logIntegrationEvent(
    integrationId: string,
    logCode: string,
    logType: 'sync' | 'error' | 'warning' | 'info',
    message: string,
    status: 'success' | 'failed' | 'pending'
  ): Promise<IntegrationLog> {
    const log: IntegrationLog = {
      id: Math.random().toString(36).substr(2, 9),
      integrationId,
      logCode,
      logType,
      message,
      status,
      createdAt: new Date(),
    };

    this.logs.set(log.id, log);
    console.log(`Log created: ${message}`);
    return log;
  }

  async getIntegrations(companyId: string, status?: string): Promise<Integration[]> {
    let integrations = Array.from(this.integrations.values()).filter((i) => i.companyId === companyId);

    if (status) {
      integrations = integrations.filter((i) => i.status === status);
    }

    return integrations;
  }

  async getEndpoints(integrationId?: string): Promise<APIEndpoint[]> {
    let endpoints = Array.from(this.endpoints.values());

    if (integrationId) {
      endpoints = endpoints.filter((e) => e.integrationId === integrationId);
    }

    return endpoints;
  }

  async getIntegrationMetrics(companyId: string): Promise<IntegrationMetrics> {
    const integrations = Array.from(this.integrations.values()).filter((i) => i.companyId === companyId);
    const activeIntegrations = integrations.filter((i) => i.status === 'active').length;

    const endpoints = Array.from(this.endpoints.values());
    const activeEndpoints = endpoints.filter((e) => e.status === 'active').length;

    const logs = Array.from(this.logs.values());
    const successfulSyncs = logs.filter((l) => l.status === 'success').length;
    const failedSyncs = logs.filter((l) => l.status === 'failed').length;

    return {
      totalIntegrations: integrations.length,
      activeIntegrations,
      totalEndpoints: endpoints.length,
      activeEndpoints,
      totalLogs: logs.length,
      successfulSyncs,
      failedSyncs,
      integrationHealthScore: 96.8,
    };
  }
}

export const integrationManagementService = new IntegrationManagementService();

