import { NextRequest, NextResponse } from 'next/server';
import { performanceEvaluationService } from '@/lib/performance-evaluation-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const evaluationSchema = z.object({
  evaluationCode: z.string(),
  evaluationName: z.string(),
  employeeId: z.string(),
  evaluatorId: z.string(),
  evaluationPeriod: z.string(),
});

const metricSchema = z.object({
  evaluationId: z.string(),
  metricCode: z.string(),
  metricName: z.string(),
  metricType: z.enum(['productivity', 'quality', 'teamwork', 'communication', 'leadership']),
  score: z.number(),
  weight: z.number(),
});

const goalSchema = z.object({
  goalCode: z.string(),
  goalName: z.string(),
  employeeId: z.string(),
  goalDescription: z.string(),
  targetValue: z.number(),
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
      const metrics = await performanceEvaluationService.getPerformanceMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
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

    if (action === 'create-evaluation') {
      const body = await request.json();
      const { evaluationCode, evaluationName, employeeId, evaluatorId, evaluationPeriod } =
        evaluationSchema.parse(body);

      const evaluation = await performanceEvaluationService.createEvaluation(
        session.companyId,
        evaluationCode,
        evaluationName,
        employeeId,
        evaluatorId,
        evaluationPeriod
      );

      return NextResponse.json(evaluation, { status: 201 });
    } else if (action === 'add-metric') {
      const body = await request.json();
      const { evaluationId, metricCode, metricName, metricType, score, weight } =
        metricSchema.parse(body);

      const metric = await performanceEvaluationService.addMetric(
        evaluationId,
        metricCode,
        metricName,
        metricType,
        score,
        weight
      );

      return NextResponse.json(metric, { status: 201 });
    } else if (action === 'create-goal') {
      const body = await request.json();
      const { goalCode, goalName, employeeId, goalDescription, targetValue } = goalSchema.parse(body);

      const goal = await performanceEvaluationService.createGoal(
        session.companyId,
        goalCode,
        goalName,
        employeeId,
        goalDescription,
        targetValue
      );

      return NextResponse.json(goal, { status: 201 });
    } else if (action === 'complete-evaluation') {
      const body = await request.json();
      const { evaluationId } = z.object({ evaluationId: z.string() }).parse(body);

      const evaluation = await performanceEvaluationService.completeEvaluation(evaluationId);
      if (!evaluation) {
        return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
      }

      return NextResponse.json(evaluation);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing performance action:', error);
    return NextResponse.json(
      { error: 'Failed to process performance action' },
      { status: 500 }
    );
  }
}

