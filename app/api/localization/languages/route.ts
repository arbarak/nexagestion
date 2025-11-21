import { NextRequest, NextResponse } from 'next/server';
import { localizationService } from '@/lib/localization-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const languageSchema = z.object({
  enabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const languages = localizationService.getLanguages();
    return NextResponse.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Language code is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { enabled } = languageSchema.parse(body);

    let language;
    if (enabled === true) {
      language = await localizationService.enableLanguage(code);
    } else if (enabled === false) {
      language = await localizationService.disableLanguage(code);
    } else {
      language = localizationService.getLanguage(code);
    }

    if (!language) {
      return NextResponse.json(
        { error: 'Language not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(language);
  } catch (error) {
    console.error('Error updating language:', error);
    return NextResponse.json(
      { error: 'Failed to update language' },
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

    const stats = await localizationService.getTranslationStats(session.companyId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}

