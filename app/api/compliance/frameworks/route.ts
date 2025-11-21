import { NextRequest, NextResponse } from 'next/server';
import { complianceService } from '@/lib/compliance-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const frameworkSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const requirementSchema = z.object({
  frameworkId: z.string(),
  requirement: z.string(),
  description: z.string(),
  dueDate: z.string().optional(),
});

const statusUpdateSchema = z.object({
  frameworkId: z.string(),
  requirementId: z.string(),
  status: z.enum(['compliant', 'non-compliant', 'in-progress']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'frameworks') {
      const frameworks = await complianceService.getFrameworks(session.companyId);
      return NextResponse.json(frameworks);
    } else if (action === 'status') {
      const status = await complianceService.getComplianceStatus(session.companyId);
      return NextResponse.json(status);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' },
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

    if (action === 'create-framework') {
      const body = await request.json();
      const { name, description } = frameworkSchema.parse(body);

      const framework = await complianceService.createFramework(
        session.companyId,
        name,
        description
      );

      return NextResponse.json(framework, { status: 201 });
    } else if (action === 'add-requirement') {
      const body = await request.json();
      const { frameworkId, requirement, description, dueDate } = requirementSchema.parse(body);

      const req = await complianceService.addRequirement(
        frameworkId,
        requirement,
        description,
        dueDate ? new Date(dueDate) : undefined
      );

      return NextResponse.json(req, { status: 201 });
    } else if (action === 'update-status') {
      const body = await request.json();
      const { frameworkId, requirementId, status } = statusUpdateSchema.parse(body);

      const requirement = await complianceService.updateRequirementStatus(
        frameworkId,
        requirementId,
        status
      );

      return NextResponse.json(requirement);
    } else if (action === 'generate-report') {
      const body = await request.json();
      const { frameworkId } = z.object({ frameworkId: z.string() }).parse(body);

      const report = await complianceService.generateReport(
        session.companyId,
        frameworkId
      );

      return NextResponse.json(report, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing compliance action:', error);
    return NextResponse.json(
      { error: 'Failed to process compliance action' },
      { status: 500 }
    );
  }
}

