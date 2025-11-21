import { NextRequest, NextResponse } from 'next/server';
import { dataWarehouse } from '@/lib/data-warehouse';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await dataWarehouse.generateDataWarehouseReport(session.companyId);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating data warehouse report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
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

    // Only admins can trigger data warehouse operations
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can trigger data warehouse operations' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'refresh_sales') {
      await dataWarehouse.createSalesFact(session.companyId);
    } else if (action === 'refresh_inventory') {
      await dataWarehouse.createInventoryFact(session.companyId);
    } else if (action === 'refresh_financial') {
      await dataWarehouse.createFinancialFact(session.companyId);
    } else if (action === 'refresh_all') {
      await Promise.all([
        dataWarehouse.createSalesFact(session.companyId),
        dataWarehouse.createInventoryFact(session.companyId),
        dataWarehouse.createFinancialFact(session.companyId),
      ]);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error processing data warehouse request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}


