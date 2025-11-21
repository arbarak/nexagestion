import { NextRequest, NextResponse } from 'next/server';
import { notificationTemplateService } from '@/lib/notification-template-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const notificationTemplateSchema = z.object({
  name: z.string(),
  title: z.string(),
  message: z.string(),
  channels: z.array(z.enum(['email', 'push', 'in-app', 'sms'])),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  variables: z.array(z.string()).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');

    const templates = await notificationTemplateService.getTemplates(session.companyId, priority || undefined);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
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
    const {
      name,
      title,
      message,
      channels,
      priority,
      variables,
      icon,
      color,
      actionUrl,
      actionLabel,
    } = notificationTemplateSchema.parse(body);

    const template = await notificationTemplateService.createTemplate(
      session.companyId,
      name,
      title,
      message,
      channels,
      priority,
      variables,
      icon,
      color,
      actionUrl,
      actionLabel
    );

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
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
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates = notificationTemplateSchema.partial().parse(body);

    const template = await notificationTemplateService.updateTemplate(
      session.companyId,
      templateId,
      updates
    );

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
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
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await notificationTemplateService.deleteTemplate(session.companyId, templateId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}


