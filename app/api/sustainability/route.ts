import { NextRequest, NextResponse } from 'next/server';
import { sustainabilityService } from '@/lib/sustainability-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const wasteSchema = z.object({
  wasteType: z.enum(['organic', 'recyclable', 'hazardous', 'general']),
  quantity: z.number(),
  unit: z.enum(['kg', 'tons', 'liters']),
  disposalMethod: z.enum(['landfill', 'recycling', 'incineration', 'composting']),
});

const initiativeSchema = z.object({
  initiativeName: z.string(),
  description: z.string(),
  category: z.enum(['energy', 'waste', 'water', 'emissions', 'other']),
  expectedSavings: z.number(),
});

const offsetSchema = z.object({
  offsetType: z.enum(['tree-planting', 'renewable-energy', 'carbon-credits', 'other']),
  quantity: z.number(),
  unit: z.string(),
  cost: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'waste') {
      const wasteType = searchParams.get('wasteType');
      const records = await sustainabilityService.getWasteRecords(
        session.companyId,
        wasteType || undefined
      );
      return NextResponse.json(records);
    } else if (action === 'initiatives') {
      const initiatives = await sustainabilityService.getGreenInitiatives(session.companyId);
      return NextResponse.json(initiatives);
    } else if (action === 'offsets') {
      const offsets = await sustainabilityService.getCarbonOffsets(session.companyId);
      return NextResponse.json(offsets);
    } else if (action === 'metrics') {
      const metrics = await sustainabilityService.getSustainabilityMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching sustainability data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sustainability data' },
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

    if (action === 'record-waste') {
      const body = await request.json();
      const { wasteType, quantity, unit, disposalMethod } = wasteSchema.parse(body);

      const record = await sustainabilityService.recordWaste(
        session.companyId,
        wasteType,
        quantity,
        unit,
        disposalMethod
      );

      return NextResponse.json(record, { status: 201 });
    } else if (action === 'create-initiative') {
      const body = await request.json();
      const { initiativeName, description, category, expectedSavings } = initiativeSchema.parse(body);

      const initiative = await sustainabilityService.createGreenInitiative(
        session.companyId,
        initiativeName,
        description,
        category,
        expectedSavings
      );

      return NextResponse.json(initiative, { status: 201 });
    } else if (action === 'record-offset') {
      const body = await request.json();
      const { offsetType, quantity, unit, cost } = offsetSchema.parse(body);

      const offset = await sustainabilityService.recordCarbonOffset(
        session.companyId,
        offsetType,
        quantity,
        unit,
        cost
      );

      return NextResponse.json(offset, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing sustainability action:', error);
    return NextResponse.json(
      { error: 'Failed to process sustainability action' },
      { status: 500 }
    );
  }
}


