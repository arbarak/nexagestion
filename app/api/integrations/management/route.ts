import { NextRequest, NextResponse } from 'next/server';
import { integrationManagementService } from '@/lib/integration-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const integrationSchema = z.object({
  integrationCode: z.string(),
  integrationName: z.string(),
  integrationType: z.enum(['api', 'webhook', 'database', 'file', 'service']),
  externalSystem: z.string(),
});

const endpointSchema = z.object({
  integrationId: z.string(),
  endpointCode: z.string(),
  endpointName: z.string(),
  endpointUrl: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  authentication: z.enum(['none', 'basic', 'bearer', 'api-key']),
});

const logSchema = z.object({
  integrationId: z.string(),
  logCode: z.string(),
  logType: z.enum(['sync', 'error', 'warning', 'info']),
  message: z.string(),
  status: z.enum(['success', 'failed', 'pending']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'integrations') {
      const status = searchParams.get('status');
      const integrations = await integrationManagementService.getIntegrations(
        session.companyId,
        status || undefined
      );
      return NextResponse.json(integrations);
    } else if (action === 'endpoints') {
      const integrationId = searchParams.get('integrationId');
      const endpoints = await integrationManagementService.getEndpoints(integrationId || undefined);
      return NextResponse.json(endpoints);
    } else if (action === 'metrics') {
      const metrics = await integrationManagementService.getIntegrationMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching integration data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-integration') {
      const body = await request.json();
      const { integrationCode, integrationName, integrationType, externalSystem } =
        integrationSchema.parse(body);

      const integration = await integrationManagementService.createIntegration(
        session.companyId,
        integrationCode,
        integrationName,
        integrationType,
        externalSystem
      );

      return NextResponse.json(integration, { status: 201 });
    } else if (action === 'create-endpoint') {
      const body = await request.json();
      const { integrationId, endpointCode, endpointName, endpointUrl, method, authentication } =
        endpointSchema.parse(body);

      const endpoint = await integrationManagementService.createEndpoint(
        integrationId,
        endpointCode,
        endpointName,
        endpointUrl,
        method,
        authentication
      );

      return NextResponse.json(endpoint, { status: 201 });
    } else if (action === 'log-event') {
      const body = await request.json();
      const { integrationId, logCode, logType, message, status } = logSchema.parse(body);

      const log = await integrationManagementService.logIntegrationEvent(
        integrationId,
        logCode,
        logType,
        message,
        status
      );

      return NextResponse.json(log, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing integration action:', error);
    return NextResponse.json(
      { error: 'Failed to process integration action' },
      { status: 500 }
    );
  }
}


