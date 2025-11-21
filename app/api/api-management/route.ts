import { NextRequest, NextResponse } from 'next/server';
import { apiManagementService } from '@/lib/api-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const keySchema = z.object({
  keyCode: z.string(),
  keyName: z.string(),
  permissions: z.array(z.string()),
  rateLimit: z.number(),
  expiryDate: z.string().transform((s) => new Date(s)).optional(),
});

const usageSchema = z.object({
  keyId: z.string(),
  usageCode: z.string(),
  endpoint: z.string(),
  method: z.string(),
  requestCount: z.number(),
  responseTime: z.number(),
  status: z.enum(['success', 'error']),
});

const versionSchema = z.object({
  versionCode: z.string(),
  versionName: z.string(),
  versionNumber: z.string(),
  releaseDate: z.string().transform((s) => new Date(s)),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      const metrics = await apiManagementService.getAPIManagementMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching API management data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API management data' },
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

    if (action === 'create-key') {
      const body = await request.json();
      const { keyCode, keyName, permissions, rateLimit, expiryDate } = keySchema.parse(body);

      const apiKey = await apiManagementService.createAPIKey(
        session.companyId,
        keyCode,
        keyName,
        permissions,
        rateLimit,
        expiryDate
      );

      return NextResponse.json(apiKey, { status: 201 });
    } else if (action === 'revoke-key') {
      const body = await request.json();
      const { keyId } = z.object({ keyId: z.string() }).parse(body);

      const apiKey = await apiManagementService.revokeAPIKey(keyId);
      if (!apiKey) {
        return NextResponse.json({ error: 'API Key not found' }, { status: 404 });
      }

      return NextResponse.json(apiKey);
    } else if (action === 'record-usage') {
      const body = await request.json();
      const { keyId, usageCode, endpoint, method, requestCount, responseTime, status } =
        usageSchema.parse(body);

      const usage = await apiManagementService.recordAPIUsage(
        keyId,
        usageCode,
        endpoint,
        method,
        requestCount,
        responseTime,
        status
      );

      return NextResponse.json(usage, { status: 201 });
    } else if (action === 'create-version') {
      const body = await request.json();
      const { versionCode, versionName, versionNumber, releaseDate } = versionSchema.parse(body);

      const version = await apiManagementService.createVersion(
        session.companyId,
        versionCode,
        versionName,
        versionNumber,
        releaseDate
      );

      return NextResponse.json(version, { status: 201 });
    } else if (action === 'deprecate-version') {
      const body = await request.json();
      const { versionId, deprecationDate } = z
        .object({ versionId: z.string(), deprecationDate: z.string().transform((s) => new Date(s)) })
        .parse(body);

      const version = await apiManagementService.deprecateVersion(versionId, deprecationDate);
      if (!version) {
        return NextResponse.json({ error: 'Version not found' }, { status: 404 });
      }

      return NextResponse.json(version);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing API management action:', error);
    return NextResponse.json(
      { error: 'Failed to process API management action' },
      { status: 500 }
    );
  }
}


