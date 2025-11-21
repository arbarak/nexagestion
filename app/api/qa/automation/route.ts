import { NextRequest, NextResponse } from 'next/server';
import { testAutomationService } from '@/lib/test-automation-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const automationScriptSchema = z.object({
  name: z.string(),
  description: z.string(),
  scriptType: z.enum(['selenium', 'cypress', 'playwright', 'appium']),
  testCaseId: z.string(),
  scriptContent: z.string(),
});

const automationRunSchema = z.object({
  scriptId: z.string(),
  successRate: z.number(),
  logs: z.string(),
});

const testReportSchema = z.object({
  name: z.string(),
  totalTests: z.number(),
  passedTests: z.number(),
  failedTests: z.number(),
  skippedTests: z.number(),
  duration: z.number(),
  environment: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'scripts') {
      const scriptType = searchParams.get('scriptType');
      const scripts = await testAutomationService.getAutomationScripts(
        session.companyId,
        scriptType || undefined
      );
      return NextResponse.json(scripts);
    } else if (action === 'reports') {
      const reports = await testAutomationService.getTestReports(session.companyId);
      return NextResponse.json(reports);
    } else if (action === 'metrics') {
      const metrics = await testAutomationService.getAutomationMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching automation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation data' },
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

    if (action === 'create-script') {
      const body = await request.json();
      const { name, description, scriptType, testCaseId, scriptContent } = automationScriptSchema.parse(body);

      const script = await testAutomationService.createAutomationScript(
        session.companyId,
        name,
        description,
        scriptType,
        testCaseId,
        scriptContent,
        session.userId
      );

      return NextResponse.json(script, { status: 201 });
    } else if (action === 'run-script') {
      const body = await request.json();
      const { scriptId, successRate, logs } = automationRunSchema.parse(body);

      const run = await testAutomationService.runAutomationScript(
        scriptId,
        successRate,
        logs
      );

      return NextResponse.json(run, { status: 201 });
    } else if (action === 'generate-report') {
      const body = await request.json();
      const { name, totalTests, passedTests, failedTests, skippedTests, duration, environment } = testReportSchema.parse(body);

      const report = await testAutomationService.generateTestReport(
        session.companyId,
        name,
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        duration,
        environment
      );

      return NextResponse.json(report, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing automation action:', error);
    return NextResponse.json(
      { error: 'Failed to process automation action' },
      { status: 500 }
    );
  }
}

