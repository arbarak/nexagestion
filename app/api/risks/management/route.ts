import { NextRequest, NextResponse } from 'next/server';
import { riskManagementService } from '@/lib/risk-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const riskSchema = z.object({
  riskCode: z.string(),
  riskName: z.string(),
  riskType: z.enum(['operational', 'financial', 'strategic', 'compliance', 'reputational']),
  probability: z.enum(['low', 'medium', 'high', 'critical']),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  mitigation: z.string(),
});

const assessmentSchema = z.object({
  riskId: z.string(),
  assessmentCode: z.string(),
  assessmentDate: z.string().transform((s) => new Date(s)),
  riskScore: z.number(),
  residualRisk: z.number(),
  assessor: z.string(),
  findings: z.string(),
});

const mitigationSchema = z.object({
  riskId: z.string(),
  mitigationCode: z.string(),
  mitigationName: z.string(),
  description: z.string(),
  owner: z.string(),
  dueDate: z.string().transform((s) => new Date(s)),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'risks') {
      const riskType = searchParams.get('riskType');
      const risks = await riskManagementService.getRisks(session.companyId, riskType || undefined);
      return NextResponse.json(risks);
    } else if (action === 'metrics') {
      const metrics = await riskManagementService.getRiskMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching risk data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk data' },
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

    if (action === 'create-risk') {
      const body = await request.json();
      const { riskCode, riskName, riskType, probability, impact, description, mitigation } =
        riskSchema.parse(body);

      const risk = await riskManagementService.createRisk(
        session.companyId,
        riskCode,
        riskName,
        riskType,
        probability,
        impact,
        description,
        mitigation
      );

      return NextResponse.json(risk, { status: 201 });
    } else if (action === 'assess-risk') {
      const body = await request.json();
      const { riskId, assessmentCode, assessmentDate, riskScore, residualRisk, assessor, findings } =
        assessmentSchema.parse(body);

      const assessment = await riskManagementService.assessRisk(
        riskId,
        assessmentCode,
        assessmentDate,
        riskScore,
        residualRisk,
        assessor,
        findings
      );

      return NextResponse.json(assessment, { status: 201 });
    } else if (action === 'create-mitigation') {
      const body = await request.json();
      const { riskId, mitigationCode, mitigationName, description, owner, dueDate } =
        mitigationSchema.parse(body);

      const mitigation = await riskManagementService.createMitigation(
        riskId,
        mitigationCode,
        mitigationName,
        description,
        owner,
        dueDate
      );

      return NextResponse.json(mitigation, { status: 201 });
    } else if (action === 'complete-mitigation') {
      const body = await request.json();
      const { mitigationId } = z.object({ mitigationId: z.string() }).parse(body);

      const mitigation = await riskManagementService.completeMitigation(mitigationId);
      if (!mitigation) {
        return NextResponse.json({ error: 'Mitigation not found' }, { status: 404 });
      }

      return NextResponse.json(mitigation);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing risk action:', error);
    return NextResponse.json(
      { error: 'Failed to process risk action' },
      { status: 500 }
    );
  }
}


