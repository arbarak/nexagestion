import { NextRequest, NextResponse } from 'next/server';
import { warehouseOperationsService } from '@/lib/warehouse-operations-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const warehouseSchema = z.object({
  warehouseCode: z.string(),
  warehouseName: z.string(),
  location: z.string(),
  capacity: z.number(),
  manager: z.string(),
});

const zoneSchema = z.object({
  warehouseId: z.string(),
  zoneCode: z.string(),
  zoneName: z.string(),
  zoneType: z.enum(['storage', 'picking', 'packing', 'receiving', 'shipping']),
  capacity: z.number(),
});

const pickingOrderSchema = z.object({
  orderCode: z.string(),
  warehouseId: z.string(),
  items: z.array(z.object({ itemId: z.string(), quantity: z.number() })),
  pickedBy: z.string(),
});

const packingOrderSchema = z.object({
  pickingOrderId: z.string(),
  packingCode: z.string(),
  warehouseId: z.string(),
  weight: z.number(),
  dimensions: z.string(),
  packedBy: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'warehouses') {
      const warehouses = await warehouseOperationsService.getWarehouses(session.companyId);
      return NextResponse.json(warehouses);
    } else if (action === 'metrics') {
      const metrics = await warehouseOperationsService.getWarehouseMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching warehouse data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouse data' },
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

    if (action === 'create-warehouse') {
      const body = await request.json();
      const { warehouseCode, warehouseName, location, capacity, manager } =
        warehouseSchema.parse(body);

      const warehouse = await warehouseOperationsService.createWarehouse(
        session.companyId,
        warehouseCode,
        warehouseName,
        location,
        capacity,
        manager
      );

      return NextResponse.json(warehouse, { status: 201 });
    } else if (action === 'create-zone') {
      const body = await request.json();
      const { warehouseId, zoneCode, zoneName, zoneType, capacity } = zoneSchema.parse(body);

      const zone = await warehouseOperationsService.createWarehouseZone(
        warehouseId,
        zoneCode,
        zoneName,
        zoneType,
        capacity
      );

      return NextResponse.json(zone, { status: 201 });
    } else if (action === 'create-picking-order') {
      const body = await request.json();
      const { orderCode, warehouseId, items, pickedBy } = pickingOrderSchema.parse(body);

      const order = await warehouseOperationsService.createPickingOrder(
        orderCode,
        warehouseId,
        items,
        pickedBy
      );

      return NextResponse.json(order, { status: 201 });
    } else if (action === 'complete-picking-order') {
      const body = await request.json();
      const { pickingOrderId } = z.object({ pickingOrderId: z.string() }).parse(body);

      const order = await warehouseOperationsService.completePickingOrder(pickingOrderId);
      if (!order) {
        return NextResponse.json({ error: 'Picking order not found' }, { status: 404 });
      }

      return NextResponse.json(order);
    } else if (action === 'create-packing-order') {
      const body = await request.json();
      const { pickingOrderId, packingCode, warehouseId, weight, dimensions, packedBy } =
        packingOrderSchema.parse(body);

      const order = await warehouseOperationsService.createPackingOrder(
        pickingOrderId,
        packingCode,
        warehouseId,
        weight,
        dimensions,
        packedBy
      );

      return NextResponse.json(order, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing warehouse action:', error);
    return NextResponse.json(
      { error: 'Failed to process warehouse action' },
      { status: 500 }
    );
  }
}


