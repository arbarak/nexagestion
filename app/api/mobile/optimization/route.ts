import { NextRequest, NextResponse } from 'next/server';
import { mobileOptimizationService } from '@/lib/mobile-optimization-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const optimizationSchema = z.object({
  feature: z.string(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const metricSchema = z.object({
  metric: z.string(),
  value: z.number(),
  unit: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'optimizations') {
      const optimizations = await mobileOptimizationService.getOptimizations(
        session.companyId
      );
      return NextResponse.json(optimizations);
    } else if (action === 'performance') {
      const stats = await mobileOptimizationService.getPerformanceStats();
      return NextResponse.json(stats);
    } else if (action === 'recommendations') {
      const recommendations = await mobileOptimizationService.getOptimizationRecommendations(
        session.companyId
      );
      return NextResponse.json(recommendations);
    } else if (action === 'breakpoints') {
      const breakpoints = await mobileOptimizationService.getResponsiveBreakpoints();
      return NextResponse.json(breakpoints);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching optimization data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch optimization data' },
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

    if (action === 'enable') {
      const body = await request.json();
      const { feature, priority } = optimizationSchema.parse(body);

      const optimization = await mobileOptimizationService.enableOptimization(
        session.companyId,
        feature,
        priority
      );

      return NextResponse.json(optimization, { status: 201 });
    } else if (action === 'metric') {
      const body = await request.json();
      const { metric, value, unit } = metricSchema.parse(body);

      await mobileOptimizationService.recordPerformanceMetric(metric, value, unit);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing optimization action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature');

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature is required' },
        { status: 400 }
      );
    }

    await mobileOptimizationService.disableOptimization(session.companyId, feature);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disabling optimization:', error);
    return NextResponse.json(
      { error: 'Failed to disable optimization' },
      { status: 500 }
    );
  }
}

