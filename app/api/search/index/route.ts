import { NextRequest, NextResponse } from 'next/server';
import { searchIndexer } from '@/lib/search-indexer';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can trigger indexing
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can trigger indexing' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type } = body;

    let results: Record<string, number>;

    if (type === 'all') {
      results = await searchIndexer.indexAll(session.companyId);
    } else if (type === 'orders') {
      results = { orders: await searchIndexer.indexOrders(session.companyId) };
    } else if (type === 'invoices') {
      results = { invoices: await searchIndexer.indexInvoices(session.companyId) };
    } else if (type === 'products') {
      results = { products: await searchIndexer.indexProducts(session.companyId) };
    } else if (type === 'clients') {
      results = { clients: await searchIndexer.indexClients(session.companyId) };
    } else if (type === 'documents') {
      results = { documents: await searchIndexer.indexDocuments(session.companyId) };
    } else {
      return NextResponse.json(
        { error: 'Invalid index type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      indexed: results,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Indexing error:', error);
    return NextResponse.json(
      { error: 'Indexing failed' },
      { status: 500 }
    );
  }
}

