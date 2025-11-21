import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get inventory by category
    const categories = await prisma.category.findMany({
      where: { companyId: session.companyId },
      include: {
        products: {
          include: {
            stocks: {
              where: { companyId: session.companyId },
              select: { quantity: true },
            },
          },
        },
      },
    });

    const inventoryData = categories.map((category: any) => {
      const totalQuantity = category.products.reduce((sum: number, product: any) => {
        const qty = product.stocks.reduce((s: number, stock: number) => s + stock.quantity, 0);
        return sum + qty;
      }, 0);

      return {
        name: category.name,
        value: totalQuantity,
      };
    });

    return NextResponse.json(inventoryData);
  } catch (error) {
    console.error('Inventory analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory analytics' }, { status: 500 });
  }
}





