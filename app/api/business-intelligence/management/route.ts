import { NextRequest, NextResponse } from 'next/server';
import { businessIntelligenceService } from '@/lib/business-intelligence-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const dashboardSchema = z.object({
  dashboardCode: z.string(),
  dashboardName: z.string(),
  dashboardType: z.enum(['executive', 'operational', 'financial', 'sales', 'hr']),
  description: z.string(),
  widgets: z.array(z.string()),
});

const reportSchema = z.object({
  reportCode: z.string(),
  reportName: z.string(),
  reportType: z.enum(['sales', 'financial', 'operational', 'hr', 'inventory']),
  dataSource: z.string(),
  filters: z.record(z.any()),
});

const vizSchema = z.object({
  reportId: z.string(),
  vizCode: z.string(),
  vizName: z.string(),
  vizType: z.enum(['bar', 'line', 'pie', 'scatter', 'heatmap']),
  dataPoints: z.number(),
  description: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'dashboards') {
      const dashboards = await businessIntelligenceService.getDashboards(session.companyId);
      return NextResponse.json(dashboards);
    } else if (action === 'reports') {
      const status = searchParams.get('status');
      const reports = await businessIntelligenceService.getReports(
        session.companyId,
        status || undefined
      );
      return NextResponse.json(reports);
    } else if (action === 'metrics') {
      const metrics = await businessIntelligenceService.getAnalyticsMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching BI data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BI data' },
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

    if (action === 'create-dashboard') {
      const body = await request.json();
      const { dashboardCode, dashboardName, dashboardType, description, widgets } =
        dashboardSchema.parse(body);

      const dashboard = await businessIntelligenceService.createDashboard(
        session.companyId,
        dashboardCode,
        dashboardName,
        dashboardType,
        description,
        widgets
      );

      return NextResponse.json(dashboard, { status: 201 });
    } else if (action === 'create-report') {
      const body = await request.json();
      const { reportCode, reportName, reportType, dataSource, filters } = reportSchema.parse(body);

      const report = await businessIntelligenceService.createReport(
        session.companyId,
        reportCode,
        reportName,
        reportType,
        dataSource,
        filters
      );

      return NextResponse.json(report, { status: 201 });
    } else if (action === 'publish-report') {
      const body = await request.json();
      const { reportId } = z.object({ reportId: z.string() }).parse(body);

      const report = await businessIntelligenceService.publishReport(reportId);
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      return NextResponse.json(report);
    } else if (action === 'create-visualization') {
      const body = await request.json();
      const { reportId, vizCode, vizName, vizType, dataPoints, description } =
        vizSchema.parse(body);

      const visualization = await businessIntelligenceService.createVisualization(
        reportId,
        vizCode,
        vizName,
        vizType,
        dataPoints,
        description
      );

      return NextResponse.json(visualization, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing BI action:', error);
    return NextResponse.json(
      { error: 'Failed to process BI action' },
      { status: 500 }
    );
  }
}

