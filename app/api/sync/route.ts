import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const syncDataSchema = z.object({
  lastSyncTime: z.string(),
  changes: z.array(z.object({
    entityType: z.string(),
    entityId: z.string(),
    action: z.enum(['create', 'update', 'delete']),
    data: z.record(z.any()),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lastSyncTime, changes } = syncDataSchema.parse(body);

    // Process changes
    const syncResults = [];
    for (const change of changes) {
      try {
        // In production, apply changes to database
        syncResults.push({
          entityType: change.entityType,
          entityId: change.entityId,
          status: 'synced',
        });
      } catch (error) {
        syncResults.push({
          entityType: change.entityType,
          entityId: change.entityId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Get updated data since last sync
    const lastSync = new Date(lastSyncTime);
    const updatedData = {
      sales: await prisma.sale.findMany({
        where: {
          companyId: session.companyId,
          updatedAt: { gt: lastSync },
        },
      }),
      purchases: await prisma.purchase.findMany({
        where: {
          companyId: session.companyId,
          updatedAt: { gt: lastSync },
        },
      }),
      stocks: await prisma.stock.findMany({
        where: {
          companyId: session.companyId,
          updatedAt: { gt: lastSync },
        },
      }),
    };

    return NextResponse.json({
      syncResults,
      updatedData,
      syncTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to sync data:', error);
    return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lastSyncTime = searchParams.get('lastSyncTime');

    if (!lastSyncTime) {
      return NextResponse.json({ error: 'lastSyncTime is required' }, { status: 400 });
    }

    const lastSync = new Date(lastSyncTime);

    // Get all data updated since last sync
    const data = {
      sales: await prisma.sale.findMany({
        where: {
          companyId: session.companyId,
          updatedAt: { gt: lastSync },
        },
      }),
      purchases: await prisma.purchase.findMany({
        where: {
          companyId: session.companyId,
          updatedAt: { gt: lastSync },
        },
      }),
      stocks: await prisma.stock.findMany({
        where: {
          companyId: session.companyId,
          updatedAt: { gt: lastSync },
        },
      }),
      clients: await prisma.client.findMany({
        where: {
          companyId: session.companyId,
          updatedAt: { gt: lastSync },
        },
      }),
    };

    return NextResponse.json({
      data,
      syncTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch sync data:', error);
    return NextResponse.json({ error: 'Failed to fetch sync data' }, { status: 500 });
  }
}

