import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const anomalySchema = z.object({
  type: z.enum(['sales', 'inventory', 'payment', 'customer']),
  threshold: z.number().default(2), // Standard deviations
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, threshold } = anomalySchema.parse(body);

    let anomalies: any[] = [];

    if (type === 'sales') {
      anomalies = await detectSalesAnomalies(session.companyId, threshold);
    } else if (type === 'inventory') {
      anomalies = await detectInventoryAnomalies(session.companyId, threshold);
    } else if (type === 'payment') {
      anomalies = await detectPaymentAnomalies(session.companyId, threshold);
    } else if (type === 'customer') {
      anomalies = await detectCustomerAnomalies(session.companyId, threshold);
    }

    // Store anomaly detection result
    const result = await prisma.aiAnomaly.create({
      data: {
        companyId: session.companyId,
        type,
        anomalies: anomalies,
        severity: calculateSeverity(anomalies),
        createdBy: session.userId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to detect anomalies:', error);
    return NextResponse.json({ error: 'Failed to detect anomalies' }, { status: 500 });
  }
}

async function detectSalesAnomalies(companyId: string, threshold: number) {
  const sales = await prisma.sale.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const values = sales.map(s => s.total || 0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);

  return sales
    .filter(s => Math.abs((s.total || 0) - mean) > threshold * stdDev)
    .map(s => ({
      id: s.id,
      type: 'sales',
      value: s.total,
      deviation: Math.abs((s.total || 0) - mean) / stdDev,
    }));
}

async function detectInventoryAnomalies(companyId: string, threshold: number) {
  const stocks = await prisma.stock.findMany({
    where: { companyId },
  });

  return stocks
    .filter(s => s.quantity < s.minQuantity * 0.5)
    .map(s => ({
      id: s.id,
      type: 'inventory',
      value: s.quantity,
      deviation: (s.minQuantity - s.quantity) / s.minQuantity,
    }));
}

async function detectPaymentAnomalies(companyId: string, threshold: number) {
  const payments = await prisma.payment.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const values = payments.map(p => p.amount);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);

  return payments
    .filter(p => Math.abs(p.amount - mean) > threshold * stdDev)
    .map(p => ({
      id: p.id,
      type: 'payment',
      value: p.amount,
      deviation: Math.abs(p.amount - mean) / stdDev,
    }));
}

async function detectCustomerAnomalies(companyId: string, threshold: number) {
  const clients = await prisma.client.findMany({
    where: { companyId },
    include: { sales: true },
  });

  const avgOrders = clients.reduce((sum, c) => sum + c.sales.length, 0) / clients.length;
  const stdDev = Math.sqrt(
    clients.reduce((sq, c) => sq + Math.pow(c.sales.length - avgOrders, 2), 0) / clients.length
  );

  return clients
    .filter(c => Math.abs(c.sales.length - avgOrders) > threshold * stdDev)
    .map(c => ({
      id: c.id,
      type: 'customer',
      value: c.sales.length,
      deviation: Math.abs(c.sales.length - avgOrders) / stdDev,
    }));
}

function calculateSeverity(anomalies: any[]): string {
  if (anomalies.length === 0) return 'low';
  const avgDeviation = anomalies.reduce((sum, a) => sum + a.deviation, 0) / anomalies.length;
  if (avgDeviation > 3) return 'critical';
  if (avgDeviation > 2) return 'high';
  return 'medium';
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

    const anomalies = await prisma.aiAnomaly.findMany({
      where: {
        companyId: session.companyId,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(anomalies);
  } catch (error) {
    console.error('Failed to fetch anomalies:', error);
    return NextResponse.json({ error: 'Failed to fetch anomalies' }, { status: 500 });
  }
}


