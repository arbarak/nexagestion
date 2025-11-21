import { NextRequest, NextResponse } from 'next/server';
import { pwaService } from '@/lib/pwa-service';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const manifest = await pwaService.generateManifest();
    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
      },
    });
  } catch (error) {
    console.error('Error generating manifest:', error);
    return NextResponse.json(
      { error: 'Failed to generate manifest' },
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

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'sync-status') {
      const syncStatus = await pwaService.getSyncStatus(session.companyId);
      return NextResponse.json(syncStatus);
    } else if (action === 'offline-queue') {
      const queue = await pwaService.getOfflineQueue(session.companyId);
      return NextResponse.json(queue);
    } else if (action === 'install-status') {
      const status = await pwaService.getInstallPromptStatus();
      return NextResponse.json(status);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing PWA action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}


