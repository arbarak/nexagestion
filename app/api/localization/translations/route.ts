import { NextRequest, NextResponse } from 'next/server';
import { localizationService } from '@/lib/localization-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const translationSchema = z.object({
  language: z.string(),
  namespace: z.string(),
  key: z.string(),
  value: z.string(),
  context: z.string().optional(),
  pluralForm: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const namespace = searchParams.get('namespace');

    if (!language || !namespace) {
      return NextResponse.json(
        { error: 'Language and namespace are required' },
        { status: 400 }
      );
    }

    const translations = await localizationService.getNamespaceTranslations(
      session.companyId,
      language,
      namespace
    );

    return NextResponse.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
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
    const { language, namespace, key, value, context, pluralForm } = translationSchema.parse(body);

    const translation = await localizationService.addTranslation(
      session.companyId,
      language,
      namespace,
      key,
      value,
      context,
      pluralForm
    );

    return NextResponse.json(translation, { status: 201 });
  } catch (error) {
    console.error('Error creating translation:', error);
    return NextResponse.json(
      { error: 'Failed to create translation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const namespace = searchParams.get('namespace');
    const key = searchParams.get('key');

    if (!language || !namespace || !key) {
      return NextResponse.json(
        { error: 'Language, namespace, and key are required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { value } = z.object({ value: z.string() }).parse(body);

    const translation = await localizationService.updateTranslation(
      session.companyId,
      language,
      namespace,
      key,
      value
    );

    if (!translation) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error updating translation:', error);
    return NextResponse.json(
      { error: 'Failed to update translation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const namespace = searchParams.get('namespace');
    const key = searchParams.get('key');

    if (!language || !namespace || !key) {
      return NextResponse.json(
        { error: 'Language, namespace, and key are required' },
        { status: 400 }
      );
    }

    await localizationService.deleteTranslation(
      session.companyId,
      language,
      namespace,
      key
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting translation:', error);
    return NextResponse.json(
      { error: 'Failed to delete translation' },
      { status: 500 }
    );
  }
}


