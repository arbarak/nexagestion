import { NextRequest, NextResponse } from 'next/server';
import { supplyChainService } from '@/lib/supply-chain-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const supplierSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  leadTime: z.number(),
});

const purchaseOrderSchema = z.object({
  supplierId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })),
  expectedDelivery: z.string(),
});

const shipmentSchema = z.object({
  purchaseOrderId: z.string(),
  trackingNumber: z.string(),
  carrier: z.string(),
  estimatedDelivery: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'suppliers') {
      const suppliers = await supplyChainService.getSuppliers(session.companyId);
      return NextResponse.json(suppliers);
    } else if (action === 'orders') {
      const status = searchParams.get('status');
      const orders = await supplyChainService.getPurchaseOrders(session.companyId, status || undefined);
      return NextResponse.json(orders);
    } else if (action === 'metrics') {
      const metrics = await supplyChainService.getSupplyChainMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching supply chain data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supply chain data' },
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

    if (action === 'create-supplier') {
      const body = await request.json();
      const { name, email, phone, address, city, country, leadTime } = supplierSchema.parse(body);

      const supplier = await supplyChainService.createSupplier(
        session.companyId,
        name,
        email,
        phone,
        address,
        city,
        country,
        leadTime
      );

      return NextResponse.json(supplier, { status: 201 });
    } else if (action === 'create-order') {
      const body = await request.json();
      const { supplierId, items, expectedDelivery } = purchaseOrderSchema.parse(body);

      const order = await supplyChainService.createPurchaseOrder(
        session.companyId,
        supplierId,
        items,
        new Date(expectedDelivery)
      );

      return NextResponse.json(order, { status: 201 });
    } else if (action === 'create-shipment') {
      const body = await request.json();
      const { purchaseOrderId, trackingNumber, carrier, estimatedDelivery } = shipmentSchema.parse(body);

      const shipment = await supplyChainService.createShipment(
        purchaseOrderId,
        trackingNumber,
        carrier,
        new Date(estimatedDelivery)
      );

      return NextResponse.json(shipment, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing supply chain action:', error);
    return NextResponse.json(
      { error: 'Failed to process supply chain action' },
      { status: 500 }
    );
  }
}


