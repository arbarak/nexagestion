import { NextRequest, NextResponse } from 'next/server';
import { qaService } from '@/lib/qa-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const testCaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  module: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  steps: z.array(z.string()),
  expectedResult: z.string(),
});

const testExecutionSchema = z.object({
  testCaseId: z.string(),
  result: z.enum(['passed', 'failed', 'blocked', 'skipped']),
  notes: z.string(),
  duration: z.number(),
  environment: z.string(),
});

const bugReportSchema = z.object({
  title: z.string(),
  description: z.string(),
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

    if (action === 'test-cases') {
      const module = searchParams.get('module');
      const testCases = await qaService.getTestCases(session.companyId, module || undefined);
      return NextResponse.json(testCases);
    } else if (action === 'metrics') {
      const metrics = await qaService.getQAMetrics(session.companyId);
      return NextResponse.json(metrics);
    } else if (action === 'bugs') {
      const status = searchParams.get('status');
      const bugs = await qaService.getBugReports(session.companyId, status || undefined);
      return NextResponse.json(bugs);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching QA data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QA data' },
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

    if (action === 'create-test-case') {
      const body = await request.json();
      const { name, description, module, priority, steps, expectedResult } = testCaseSchema.parse(body);

      const testCase = await qaService.createTestCase(
        session.companyId,
        name,
        description,
        module,
        priority,
        steps,
        expectedResult,
        session.userId
      );

      return NextResponse.json(testCase, { status: 201 });
    } else if (action === 'execute-test') {
      const body = await request.json();
      const { testCaseId, result, notes, duration, environment } = testExecutionSchema.parse(body);

      const execution = await qaService.executeTestCase(
        testCaseId,
        session.userId,
        result,
        notes,
        duration,
        environment
      );

      return NextResponse.json(execution, { status: 201 });
    } else if (action === 'report-bug') {
      const body = await request.json();
      const { title, description, severity } = bugReportSchema.parse(body);

      const bug = await qaService.reportBug(
        session.companyId,
        title,
        description,
        severity,
        session.userId
      );

      return NextResponse.json(bug, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing QA action:', error);
    return NextResponse.json(
      { error: 'Failed to process QA action' },
      { status: 500 }
    );
  }
}

