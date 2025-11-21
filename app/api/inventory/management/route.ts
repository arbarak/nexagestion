import { NextRequest, NextResponse } from 'next/server';
import { inventoryManagementService } from '@/lib/inventory-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const itemSchema = z.object({
  itemCode: z.string(),
  itemName: z.string(),
  category: z.string(),
  quantity: z.number(),
  reorderLevel: z.number(),
  unitPrice: z.number(),
  warehouseLocation: z.string(),
});

const movementSchema = z.object({
  itemId: z.string(),
  movementType: z.enum(['inbound', 'outbound', 'adjustment', 'return']),
  quantity: z.number(),
  reference: z.string(),
  reason: z.string(),
});

const adjustmentSchema = z.object({
  itemId: z.string(),
  adjustmentCode: z.string(),
  adjustmentType: z.enum(['increase', 'decrease', 'correction']),
  quantity: z.number(),
  reason: z.string(),
  approvedBy: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'items') {
      const status = searchParams.get('status');
      const items = await inventoryManagementService.getInventoryItems(
        session.companyId,
        status || undefined
      );
      return NextResponse.json(items);
    } else if (action === 'movements') {
      const itemId = searchParams.get('itemId');
      const movements = await inventoryManagementService.getStockMovements(itemId || undefined);
      return NextResponse.json(movements);
    } else if (action === 'metrics') {
      const metrics = await inventoryManagementService.getInventoryMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' },
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

    if (action === 'create-item') {
      const body = await request.json();
      const { itemCode, itemName, category, quantity, reorderLevel, unitPrice, warehouseLocation } =
        itemSchema.parse(body);

      const item = await inventoryManagementService.createInventoryItem(
        session.companyId,
        itemCode,
        itemName,
        category,
        quantity,
        reorderLevel,
        unitPrice,
        warehouseLocation
      );

      return NextResponse.json(item, { status: 201 });
    } else if (action === 'record-movement') {
      const body = await request.json();
      const { itemId, movementType, quantity, reference, reason } = movementSchema.parse(body);

      const movement = await inventoryManagementService.recordStockMovement(
        itemId,
        movementType,
        quantity,
        reference,
        reason
      );

      return NextResponse.json(movement, { status: 201 });
    } else if (action === 'create-adjustment') {
      const body = await request.json();
      const { itemId, adjustmentCode, adjustmentType, quantity, reason, approvedBy } =
        adjustmentSchema.parse(body);

      const adjustment = await inventoryManagementService.createAdjustment(
        itemId,
        adjustmentCode,
        adjustmentType,
        quantity,
        reason,
        approvedBy
      );

      return NextResponse.json(adjustment, { status: 201 });
    } else if (action === 'approve-adjustment') {
      const body = await request.json();
      const { adjustmentId } = z.object({ adjustmentId: z.string() }).parse(body);

      const adjustment = await inventoryManagementService.approveAdjustment(adjustmentId);
      if (!adjustment) {
        return NextResponse.json({ error: 'Adjustment not found' }, { status: 404 });
      }

      return NextResponse.json(adjustment);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing inventory action:', error);
    return NextResponse.json(
      { error: 'Failed to process inventory action' },
      { status: 500 }
    );
  }
}

