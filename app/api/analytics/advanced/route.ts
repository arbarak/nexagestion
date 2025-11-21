import { NextRequest, NextResponse } from 'next/server';
import { advancedAnalyticsService } from '@/lib/advanced-analytics-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const querySchema = z.object({
  queryCode: z.string(),
  queryName: z.string(),
  queryType: z.enum(['ad-hoc', 'scheduled', 'real-time']),
  sqlQuery: z.string(),
});

const modelSchema = z.object({
  modelCode: z.string(),
  modelName: z.string(),
  modelType: z.enum(['regression', 'classification', 'clustering', 'forecasting']),
  trainingDataSize: z.number(),
});

const alertSchema = z.object({
  alertCode: z.string(),
  alertName: z.string(),
  alertType: z.enum(['threshold', 'anomaly', 'trend', 'forecast']),
  condition: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      const metrics = await advancedAnalyticsService.getAnalyticsMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-query') {
      const body = await request.json();
      const { queryCode, queryName, queryType, sqlQuery } = querySchema.parse(body);

      const query = await advancedAnalyticsService.createQuery(
        session.companyId,
        queryCode,
        queryName,
        queryType,
        sqlQuery
      );

      return NextResponse.json(query, { status: 201 });
    } else if (action === 'execute-query') {
      const body = await request.json();
      const { queryId, resultCount, executionTime } = z
        .object({ queryId: z.string(), resultCount: z.number(), executionTime: z.number() })
        .parse(body);

      const query = await advancedAnalyticsService.executeQuery(queryId, resultCount, executionTime);
      if (!query) {
        return NextResponse.json({ error: 'Query not found' }, { status: 404 });
      }

      return NextResponse.json(query);
    } else if (action === 'create-model') {
      const body = await request.json();
      const { modelCode, modelName, modelType, trainingDataSize } = modelSchema.parse(body);

      const model = await advancedAnalyticsService.createModel(
        session.companyId,
        modelCode,
        modelName,
        modelType,
        trainingDataSize
      );

      return NextResponse.json(model, { status: 201 });
    } else if (action === 'activate-model') {
      const body = await request.json();
      const { modelId, accuracy } = z
        .object({ modelId: z.string(), accuracy: z.number() })
        .parse(body);

      const model = await advancedAnalyticsService.activateModel(modelId, accuracy);
      if (!model) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }

      return NextResponse.json(model);
    } else if (action === 'create-alert') {
      const body = await request.json();
      const { alertCode, alertName, alertType, condition, severity } = alertSchema.parse(body);

      const alert = await advancedAnalyticsService.createAlert(
        session.companyId,
        alertCode,
        alertName,
        alertType,
        condition,
        severity
      );

      return NextResponse.json(alert, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing analytics action:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics action' },
      { status: 500 }
    );
  }
}

