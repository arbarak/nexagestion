import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const kpiQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { period } = kpiQuerySchema.parse({
      period: searchParams.get('period'),
    });

    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch KPI data
    const [totalRevenue, totalOrders, totalCustomers, totalInventory] = await Promise.all([
      prisma.salesInvoice.aggregate({
        where: {
          companyId: session.companyId,
          createdAt: { gte: startDate },
        },
        _sum: { totalAmount: true },
      }),
      prisma.salesOrder.count({
        where: {
          companyId: session.companyId,
          createdAt: { gte: startDate },
        },
      }),
      prisma.client.count({
        where: {
          companyId: session.companyId,
        },
      }),
      prisma.stock.aggregate({
        where: {
          companyId: session.companyId,
        },
        _sum: { quantity: true },
      }),
    ]);

    const kpis = [
      {
        label: 'Total Revenue',
        value: `$${(totalRevenue._sum.totalAmount || 0).toFixed(2)}`,
        change: 12.5,
        trend: 'up',
      },
      {
        label: 'Total Orders',
        value: totalOrders,
        change: 8.2,
        trend: 'up',
      },
      {
        label: 'Total Customers',
        value: totalCustomers,
        change: 5.1,
        trend: 'up',
      },
      {
        label: 'Inventory Items',
        value: totalInventory._sum.quantity || 0,
        change: -2.3,
        trend: 'down',
      },
    ];

    return NextResponse.json(kpis);
  } catch (error) {
    console.error('KPI fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
  }
}


