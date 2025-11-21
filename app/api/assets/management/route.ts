import { NextRequest, NextResponse } from 'next/server';
import { assetManagementService } from '@/lib/asset-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const assetSchema = z.object({
  assetCode: z.string(),
  name: z.string(),
  category: z.string(),
  purchaseDate: z.string(),
  purchasePrice: z.number(),
  location: z.string(),
});

const maintenanceScheduleSchema = z.object({
  assetId: z.string(),
  maintenanceType: z.enum(['preventive', 'corrective', 'predictive']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  estimatedCost: z.number(),
});

const maintenanceRecordSchema = z.object({
  scheduleId: z.string(),
  assetId: z.string(),
  description: z.string(),
  cost: z.number(),
  duration: z.number(),
  technician: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'assets') {
      const status = searchParams.get('status');
      const assets = await assetManagementService.getAssets(session.companyId, status || undefined);
      return NextResponse.json(assets);
    } else if (action === 'schedules') {
      const assetId = searchParams.get('assetId');
      const schedules = await assetManagementService.getMaintenanceSchedules(assetId || undefined);
      return NextResponse.json(schedules);
    } else if (action === 'metrics') {
      const metrics = await assetManagementService.getAssetMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching asset data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset data' },
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

    if (action === 'create-asset') {
      const body = await request.json();
      const { assetCode, name, category, purchaseDate, purchasePrice, location } =
        assetSchema.parse(body);

      const asset = await assetManagementService.createAsset(
        session.companyId,
        assetCode,
        name,
        category,
        new Date(purchaseDate),
        purchasePrice,
        location
      );

      return NextResponse.json(asset, { status: 201 });
    } else if (action === 'schedule-maintenance') {
      const body = await request.json();
      const { assetId, maintenanceType, frequency, estimatedCost } =
        maintenanceScheduleSchema.parse(body);

      const schedule = await assetManagementService.scheduleMaintenanceAsync(
        assetId,
        maintenanceType,
        frequency,
        estimatedCost
      );

      return NextResponse.json(schedule, { status: 201 });
    } else if (action === 'record-maintenance') {
      const body = await request.json();
      const { scheduleId, assetId, description, cost, duration, technician } =
        maintenanceRecordSchema.parse(body);

      const record = await assetManagementService.recordMaintenance(
        scheduleId,
        assetId,
        description,
        cost,
        duration,
        technician
      );

      return NextResponse.json(record, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing asset action:', error);
    return NextResponse.json(
      { error: 'Failed to process asset action' },
      { status: 500 }
    );
  }
}


