import { NextRequest, NextResponse } from 'next/server';
import { energyManagementService } from '@/lib/energy-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const consumptionSchema = z.object({
  facilityId: z.string(),
  energyType: z.enum(['electricity', 'gas', 'water', 'renewable']),
  consumption: z.number(),
  unit: z.enum(['kWh', 'm3', 'liters', 'BTU']),
  cost: z.number(),
});

const targetSchema = z.object({
  targetType: z.enum(['reduction', 'efficiency', 'renewable']),
  targetValue: z.number(),
  targetUnit: z.string(),
  deadline: z.string(),
});

const metricSchema = z.object({
  metricType: z.enum(['carbon-footprint', 'waste-reduction', 'water-usage', 'renewable-energy']),
  value: z.number(),
  unit: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'consumptions') {
      const energyType = searchParams.get('energyType');
      const consumptions = await energyManagementService.getEnergyConsumptions(
        session.companyId,
        energyType || undefined
      );
      return NextResponse.json(consumptions);
    } else if (action === 'targets') {
      const targets = await energyManagementService.getEnergyTargets(session.companyId);
      return NextResponse.json(targets);
    } else if (action === 'metrics') {
      const metrics = await energyManagementService.getEnergyMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching energy data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch energy data' },
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

    if (action === 'record-consumption') {
      const body = await request.json();
      const { facilityId, energyType, consumption, unit, cost } = consumptionSchema.parse(body);

      const record = await energyManagementService.recordEnergyConsumption(
        session.companyId,
        facilityId,
        energyType,
        consumption,
        unit,
        cost
      );

      return NextResponse.json(record, { status: 201 });
    } else if (action === 'set-target') {
      const body = await request.json();
      const { targetType, targetValue, targetUnit, deadline } = targetSchema.parse(body);

      const target = await energyManagementService.setEnergyTarget(
        session.companyId,
        targetType,
        targetValue,
        targetUnit,
        new Date(deadline)
      );

      return NextResponse.json(target, { status: 201 });
    } else if (action === 'record-metric') {
      const body = await request.json();
      const { metricType, value, unit } = metricSchema.parse(body);

      const metric = await energyManagementService.recordSustainabilityMetric(
        session.companyId,
        metricType,
        value,
        unit
      );

      return NextResponse.json(metric, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing energy action:', error);
    return NextResponse.json(
      { error: 'Failed to process energy action' },
      { status: 500 }
    );
  }
}


