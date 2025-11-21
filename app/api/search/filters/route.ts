import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get('type');

    // Get available filter options based on type
    const filters: Record<string, any> = {
      statuses: [],
      types: [],
      dateRanges: [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'This Year', value: 'year' },
        { label: 'All Time', value: 'all' },
      ],
      tags: [],
    };

    // Get statuses based on type
    if (type === 'order') {
      filters.statuses = [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ];
    } else if (type === 'invoice') {
      filters.statuses = [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' },
      ];
    } else if (type === 'document') {
      filters.statuses = [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ];
    }

    // Get available types
    filters.types = [
      { label: 'Orders', value: 'order' },
      { label: 'Invoices', value: 'invoice' },
      { label: 'Documents', value: 'document' },
      { label: 'Products', value: 'product' },
      { label: 'Clients', value: 'client' },
      { label: 'Suppliers', value: 'supplier' },
    ];

    // Get tags from database
    const tags = await prisma.tag.findMany({
      where: { companyId: session.companyId },
      select: { id: true, name: true },
      take: 50,
    });

    filters.tags = tags.map(tag => ({
      label: tag.name,
      value: tag.id,
    }));

    return NextResponse.json(filters);
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}

