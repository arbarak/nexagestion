import { NextRequest, NextResponse } from 'next/server';
import { logisticsService } from '@/lib/logistics-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const warehouseSchema = z.object({
  name: z.string(),
  location: z.string(),
  capacity: z.number(),
  manager: z.string(),
});

const routeSchema = z.object({
  name: z.string(),
  origin: z.string(),
  destination: z.string(),
  distance: z.number(),
  estimatedTime: z.number(),
  cost: z.number(),
});

const deliverySchema = z.object({
  orderId: z.string(),
  routeId: z.string(),
  driver: z.string(),
  vehicle: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'warehouses') {
      const warehouses = await logisticsService.getWarehouses(session.companyId);
      return NextResponse.json(warehouses);
    } else if (action === 'routes') {
      const routes = await logisticsService.getRoutes(session.companyId);
      return NextResponse.json(routes);
    } else if (action === 'deliveries') {
      const status = searchParams.get('status');
      const deliveries = await logisticsService.getDeliveries(session.companyId, status || undefined);
      return NextResponse.json(deliveries);
    } else if (action === 'metrics') {
      const metrics = await logisticsService.getLogisticsMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching logistics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logistics data' },
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

    if (action === 'create-warehouse') {
      const body = await request.json();
      const { name, location, capacity, manager } = warehouseSchema.parse(body);

      const warehouse = await logisticsService.createWarehouse(
        session.companyId,
        name,
        location,
        capacity,
        manager
      );

      return NextResponse.json(warehouse, { status: 201 });
    } else if (action === 'create-route') {
      const body = await request.json();
      const { name, origin, destination, distance, estimatedTime, cost } = routeSchema.parse(body);

      const route = await logisticsService.createRoute(
        session.companyId,
        name,
        origin,
        destination,
        distance,
        estimatedTime,
        cost
      );

      return NextResponse.json(route, { status: 201 });
    } else if (action === 'create-delivery') {
      const body = await request.json();
      const { orderId, routeId, driver, vehicle } = deliverySchema.parse(body);

      const delivery = await logisticsService.createDelivery(
        session.companyId,
        orderId,
        routeId,
        driver,
        vehicle
      );

      return NextResponse.json(delivery, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing logistics action:', error);
    return NextResponse.json(
      { error: 'Failed to process logistics action' },
      { status: 500 }
    );
  }
}

