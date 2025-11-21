import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12');

    const financialData = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [revenue, expenses] = await Promise.all([
        prisma.salesInvoice.aggregate({
          where: {
            companyId: session.companyId,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { totalAmount: true },
        }),
        prisma.purchaseInvoice.aggregate({
          where: {
            companyId: session.companyId,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { totalAmount: true },
        }),
      ]);

      const monthName = monthStart.toLocaleString('default', { month: 'short' });
      financialData.push({
        month: monthName,
        revenue: revenue._sum.totalAmount || 0,
        expenses: expenses._sum.totalAmount || 0,
        profit: (revenue._sum.totalAmount || 0) - (expenses._sum.totalAmount || 0),
      });
    }

    return NextResponse.json(financialData);
  } catch (error) {
    console.error('Financial analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch financial analytics' }, { status: 500 });
  }
}

