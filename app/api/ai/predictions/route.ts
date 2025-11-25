import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const predictionSchema = z.object({
  type: z.enum(['sales', 'demand', 'churn', 'revenue']),
  period: z.enum(['week', 'month', 'quarter']),
  productId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, period, productId } = predictionSchema.parse(body);

    // Fetch historical data
    const sales = await prisma.sale.findMany({
      where: {
        companyId: session.companyId,
        ...(productId && { items: { some: { productId } } }),
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Simple ML prediction (in production, use TensorFlow.js or similar)
    const predictions = generatePredictions(sales, type, period);

    // Store prediction
    const prediction = await prisma.aIPrediction.create({
      data: {
        companyId: session.companyId,
        type,
        period,
        productId: productId || null,
        predictions: predictions,
        confidence: calculateConfidence(sales.length),
        createdBy: session.userId,
      },
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Failed to generate prediction:', error);
    return NextResponse.json({ error: 'Failed to generate prediction' }, { status: 500 });
  }
}

function generatePredictions(sales: any[], type: string, period: string): any[] {
  const predictions = [];
  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;
  
  // Calculate average daily sales
  const avgDaily = sales.reduce((sum: number, s: any) => sum + (s.total || 0), 0) / Math.max(sales.length, 1);
  
  for (let i = 1; i <= 4; i++) {
    const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
    predictions.push({
      period: i,
      value: Math.round(avgDaily * periodDays * (1 + variance)),
      confidence: 0.85 - (i * 0.05),
    });
  }
  
  return predictions;
}

function calculateConfidence(dataPoints: number): number {
  return Math.min(0.95, 0.5 + (dataPoints / 200));
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

    const predictions = await prisma.aIPrediction.findMany({
      where: {
        companyId: session.companyId,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Failed to fetch predictions:', error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}





