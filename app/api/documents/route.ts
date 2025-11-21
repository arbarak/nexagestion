import { NextRequest, NextResponse } from 'next/server';
import { documentManagementService } from '@/lib/document-management-service';
import { fileStorageService } from '@/lib/file-storage-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const documentSchema = z.object({
  name: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  category: z.enum(['invoice', 'contract', 'report', 'receipt', 'other']),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  expiresAt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',');
    const search = searchParams.get('search');

    let documents;
    if (search) {
      documents = await documentManagementService.searchDocuments(session.companyId, search);
    } else {
      documents = await documentManagementService.getDocuments(
        session.companyId,
        category || undefined,
        tags
      );
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      fileType,
      fileSize,
      mimeType,
      category,
      tags,
      isPublic,
      expiresAt,
      metadata,
    } = documentSchema.parse(body);

    // Check quota
    const canUpload = await fileStorageService.checkQuotaAvailable(session.companyId, fileSize);
    if (!canUpload) {
      return NextResponse.json(
        { error: 'Storage quota exceeded' },
        { status: 413 }
      );
    }

    const document = await documentManagementService.uploadDocument(
      session.companyId,
      name,
      fileType,
      fileSize,
      mimeType,
      category,
      session.userId,
      undefined,
      tags,
      isPublic,
      expiresAt ? new Date(expiresAt) : undefined,
      metadata
    );

    // Update quota
    await fileStorageService.updateQuotaUsage(session.companyId, fileSize, true);

    // Add version
    await fileStorageService.addFileVersion(document.id, fileSize, session.userId);

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const document = await documentManagementService.getDocument(session.companyId, documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    await documentManagementService.deleteDocument(session.companyId, documentId);
    await fileStorageService.updateQuotaUsage(session.companyId, document.fileSize, false);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

