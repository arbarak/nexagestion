import { NextRequest, NextResponse } from 'next/server';
import { qualityManagementService } from '@/lib/quality-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const standardSchema = z.object({
  standardCode: z.string(),
  standardName: z.string(),
  standardType: z.enum(['iso', 'internal', 'industry', 'regulatory']),
  description: z.string(),
});

const inspectionSchema = z.object({
  inspectionCode: z.string(),
  inspectionName: z.string(),
  inspectionType: z.enum(['incoming', 'in-process', 'final', 'audit']),
  productId: z.string(),
  inspectorId: z.string(),
  result: z.enum(['pass', 'fail', 'conditional']),
});

const defectSchema = z.object({
  defectCode: z.string(),
  defectName: z.string(),
  defectType: z.enum(['critical', 'major', 'minor']),
  severity: z.number(),
  description: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      const metrics = await qualityManagementService.getQualityMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching quality data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quality data' },
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

    if (action === 'create-standard') {
      const body = await request.json();
      const { standardCode, standardName, standardType, description } = standardSchema.parse(body);

      const standard = await qualityManagementService.createStandard(
        session.companyId,
        standardCode,
        standardName,
        standardType,
        description
      );

      return NextResponse.json(standard, { status: 201 });
    } else if (action === 'create-inspection') {
      const body = await request.json();
      const { inspectionCode, inspectionName, inspectionType, productId, inspectorId, result } =
        inspectionSchema.parse(body);

      const inspection = await qualityManagementService.createInspection(
        session.companyId,
        inspectionCode,
        inspectionName,
        inspectionType,
        productId,
        inspectorId,
        result
      );

      return NextResponse.json(inspection, { status: 201 });
    } else if (action === 'create-defect') {
      const body = await request.json();
      const { defectCode, defectName, defectType, severity, description } = defectSchema.parse(body);

      const defect = await qualityManagementService.createDefect(
        session.companyId,
        defectCode,
        defectName,
        defectType,
        severity,
        description
      );

      return NextResponse.json(defect, { status: 201 });
    } else if (action === 'resolve-defect') {
      const body = await request.json();
      const { defectId } = z.object({ defectId: z.string() }).parse(body);

      const defect = await qualityManagementService.resolveDefect(defectId);
      if (!defect) {
        return NextResponse.json({ error: 'Defect not found' }, { status: 404 });
      }

      return NextResponse.json(defect);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing quality action:', error);
    return NextResponse.json(
      { error: 'Failed to process quality action' },
      { status: 500 }
    );
  }
}


