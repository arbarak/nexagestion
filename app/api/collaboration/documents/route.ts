import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const documentSchema = z.object({
  title: z.string(),
  content: z.string(),
  type: z.enum(['document', 'spreadsheet', 'presentation']),
  collaborators: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, type, collaborators } = documentSchema.parse(body);

    // Create collaboration document
    const document = await prisma.collaborationDocument.create({
      data: {
        companyId: session.companyId,
        title,
        content,
        type,
        ownerId: session.userId,
        version: 1,
        collaborators: collaborators || [session.userId],
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const documents = await prisma.collaborationDocument.findMany({
      where: {
        companyId: session.companyId,
        ...(type && { type }),
        OR: [
          { ownerId: session.userId },
          { collaborators: { has: session.userId } },
        ],
      },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
        comments: { take: 5, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}


