import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/audit-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const complianceSchema = z.object({
  type: z.enum(['gdpr', 'hipaa', 'pci-dss', 'sox']),
  dateFrom: z.string(),
  dateTo: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get('type') as any;
    const dateFrom = request.nextUrl.searchParams.get('dateFrom');
    const dateTo = request.nextUrl.searchParams.get('dateTo');

    if (!type || !dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const report = await auditService.generateComplianceReport(
      session.companyId,
      type,
      new Date(dateFrom),
      new Date(dateTo)
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating compliance report:', error);
    return NextResponse.json(
      { error: 'Failed to generate compliance report' },
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

    const body = await request.json();
    const { type, dateFrom, dateTo } = complianceSchema.parse(body);

    const report = await auditService.generateComplianceReport(
      session.companyId,
      type,
      new Date(dateFrom),
      new Date(dateTo)
    );

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating compliance report:', error);
    return NextResponse.json(
      { error: 'Failed to create compliance report' },
      { status: 500 }
    );
  }
}

