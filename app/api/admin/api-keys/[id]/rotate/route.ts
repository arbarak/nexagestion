import { NextRequest, NextResponse } from 'next/server';
import { apiKeyService } from '@/lib/api-key-service';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const keyId = id;

    const rotatedKey = await apiKeyService.rotateApiKey(session.companyId, keyId);

    return NextResponse.json(rotatedKey);
  } catch (error) {
    console.error('Error rotating API key:', error);
    return NextResponse.json(
      { error: 'Failed to rotate API key' },
      { status: 500 }
    );
  }
}

