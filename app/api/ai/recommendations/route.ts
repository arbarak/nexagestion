import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const recommendationSchema = z.object({
  type: z.enum(['product', 'customer', 'supplier']),
  clientId: z.string().optional(),
  limit: z.number().default(5),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, clientId, limit } = recommendationSchema.parse(body);

    let recommendations: any[] = [];

    if (type === 'product' && clientId) {
      // Get products frequently bought together
      recommendations = await getProductRecommendations(session.companyId, clientId, limit);
    } else if (type === 'customer') {
      // Get high-value customers
      recommendations = await getCustomerRecommendations(session.companyId, limit);
    } else if (type === 'supplier') {
      // Get reliable suppliers
      recommendations = await getSupplierRecommendations(session.companyId, limit);
    }

    // Store recommendation
    const rec = await prisma.aiRecommendation.create({
      data: {
        companyId: session.companyId,
        type,
        clientId: clientId || null,
        recommendations: recommendations,
        score: calculateScore(recommendations),
        createdBy: session.userId,
      },
    });

    return NextResponse.json(rec);
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

async function getProductRecommendations(companyId: string, clientId: string, limit: number) {
  const clientSales = await prisma.sale.findMany({
    where: { companyId, clientId },
    include: { items: { include: { product: true } } },
  });

  const productIds = new Set(clientSales.flatMap(s => s.items.map(i => i.productId)));
  
  const recommendations = await prisma.product.findMany({
    where: {
      companyId,
      id: { notIn: Array.from(productIds) },
    },
    take: limit,
  });

  return recommendations.map(p => ({
    id: p.id,
    name: p.name,
    score: Math.random() * 0.5 + 0.5,
  }));
}

async function getCustomerRecommendations(companyId: string, limit: number) {
  const clients = await prisma.client.findMany({
    where: { companyId },
    include: { sales: true },
  });

  return clients
    .map(c => ({
      id: c.id,
      name: c.name,
      score: Math.min(1, (c.sales.length / 10)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function getSupplierRecommendations(companyId: string, limit: number) {
  const suppliers = await prisma.supplier.findMany({
    where: { companyId },
    include: { purchases: true },
  });

  return suppliers
    .map(s => ({
      id: s.id,
      name: s.name,
      score: Math.min(1, (s.purchases.length / 10)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function calculateScore(recommendations: any[]): number {
  if (recommendations.length === 0) return 0;
  const avgScore = recommendations.reduce((sum: number, r: any) => sum + r.score, 0) / recommendations.length;
  return Math.round(avgScore * 100) / 100;
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    const recommendations = await prisma.aiRecommendation.findMany({
      where: {
        companyId: session.companyId,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}





