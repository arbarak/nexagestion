import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12');

    const salesData = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const sales = await prisma.salesInvoice.aggregate({
        where: {
          companyId: session.companyId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { totalAmount: true },
        _count: true,
      });

      const monthName = monthStart.toLocaleString('default', { month: 'short' });
      salesData.push({
        month: monthName,
        sales: sales._sum.totalAmount || 0,
        target: 50000,
        orders: sales._count,
      });
    }

    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Sales analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales analytics' }, { status: 500 });
  }
}


