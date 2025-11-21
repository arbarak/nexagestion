import { NextRequest, NextResponse } from 'next/server';
import { scheduledReportsService } from '@/lib/scheduled-reports';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const scheduledReportSchema = z.object({
  name: z.string(),
  type: z.enum(['sales', 'inventory', 'financial']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  recipients: z.array(z.string().email()),
  enabled: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await scheduledReportsService.getScheduledReports(session.companyId);
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching scheduled reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled reports' },
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

    const body = await request.json();
    const config = scheduledReportSchema.parse(body);

    const report = await scheduledReportsService.createScheduledReport(
      session.companyId,
      config
    );

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating scheduled report:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled report' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, ...updates } = body;

    const report = await scheduledReportsService.updateScheduledReport(
      session.companyId,
      reportId,
      updates
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating scheduled report:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled report' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    await scheduledReportsService.deleteScheduledReport(session.companyId, reportId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled report' },
      { status: 500 }
    );
  }
}


