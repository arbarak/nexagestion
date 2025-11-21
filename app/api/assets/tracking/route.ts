import { NextRequest, NextResponse } from 'next/server';
import { assetTrackingService } from '@/lib/asset-tracking-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const locationSchema = z.object({
  assetId: z.string(),
  location: z.string(),
  department: z.string(),
  assignedTo: z.string(),
});

const updateLocationSchema = z.object({
  assetId: z.string(),
  location: z.string(),
  status: z.enum(['in-use', 'in-storage', 'in-transit', 'lost']),
});

const depreciationSchema = z.object({
  assetId: z.string(),
  depreciationMethod: z.enum(['straight-line', 'declining-balance', 'units-of-production']),
  usefulLife: z.number(),
  salvageValue: z.number(),
  assetCost: z.number(),
});

const disposalSchema = z.object({
  assetId: z.string(),
  disposalMethod: z.enum(['sale', 'donation', 'scrap', 'trade-in']),
  disposalPrice: z.number(),
  bookValue: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'locations') {
      const assetId = searchParams.get('assetId');
      const locations = await assetTrackingService.getAssetLocations(assetId || undefined);
      return NextResponse.json(locations);
    } else if (action === 'depreciation') {
      const assetId = searchParams.get('assetId');
      const schedules = await assetTrackingService.getDepreciationSchedules(assetId || undefined);
      return NextResponse.json(schedules);
    } else if (action === 'metrics') {
      const metrics = await assetTrackingService.getAssetTrackingMetrics();
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching asset tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset tracking data' },
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

    if (action === 'track-location') {
      const body = await request.json();
      const { assetId, location, department, assignedTo } = locationSchema.parse(body);

      const tracking = await assetTrackingService.trackAssetLocation(
        assetId,
        location,
        department,
        assignedTo
      );

      return NextResponse.json(tracking, { status: 201 });
    } else if (action === 'update-location') {
      const body = await request.json();
      const { assetId, location, status } = updateLocationSchema.parse(body);

      const tracking = await assetTrackingService.updateAssetLocation(assetId, location, status);
      if (!tracking) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      return NextResponse.json(tracking);
    } else if (action === 'create-depreciation') {
      const body = await request.json();
      const { assetId, depreciationMethod, usefulLife, salvageValue, assetCost } =
        depreciationSchema.parse(body);

      const schedule = await assetTrackingService.createDepreciationSchedule(
        assetId,
        depreciationMethod,
        usefulLife,
        salvageValue,
        assetCost
      );

      return NextResponse.json(schedule, { status: 201 });
    } else if (action === 'dispose-asset') {
      const body = await request.json();
      const { assetId, disposalMethod, disposalPrice, bookValue } = disposalSchema.parse(body);

      const disposal = await assetTrackingService.disposeAsset(
        assetId,
        disposalMethod,
        disposalPrice,
        bookValue
      );

      return NextResponse.json(disposal, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing asset tracking action:', error);
    return NextResponse.json(
      { error: 'Failed to process asset tracking action' },
      { status: 500 }
    );
  }
}

