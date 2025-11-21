import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchService } from '@/lib/search-service';
import { verifyAuth } from '@/lib/auth';

const searchSchema = z.object({
  query: z.string().min(1).max(500),
  type: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const validated = searchSchema.parse({
      query,
      type,
      status,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    const results = await searchService.search(
      validated.query,
      {
        type: validated.type,
        companyId: session.companyId,
        status: validated.status,
        dateFrom: validated.dateFrom ? new Date(validated.dateFrom) : undefined,
        dateTo: validated.dateTo ? new Date(validated.dateTo) : undefined,
      },
      validated.limit,
      validated.offset
    );

    return NextResponse.json({
      results,
      total: results.length,
      limit: validated.limit,
      offset: validated.offset,
    });
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Search failed' },
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

    const body = await request.json();
    const { index, documents } = body;

    if (!index || !documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    await searchService.bulkIndex(index, documents);

    return NextResponse.json({
      success: true,
      indexed: documents.length,
    });
  } catch (error) {
    console.error('Indexing error:', error);
    return NextResponse.json(
      { error: 'Indexing failed' },
      { status: 500 }
    );
  }
}


