import { NextRequest, NextResponse } from 'next/server';
import { communicationService } from '@/lib/communication-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const messageSchema = z.object({
  messageCode: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  messageContent: z.string(),
  messageType: z.enum(['text', 'email', 'notification', 'alert']),
});

const announcementSchema = z.object({
  announcementCode: z.string(),
  announcementTitle: z.string(),
  announcementContent: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  targetAudience: z.string(),
});

const channelSchema = z.object({
  channelCode: z.string(),
  channelName: z.string(),
  channelType: z.enum(['team', 'department', 'project', 'general']),
  description: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      const metrics = await communicationService.getCommunicationMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching communication data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communication data' },
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

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'send-message') {
      const body = await request.json();
      const { messageCode, senderId, recipientId, messageContent, messageType } =
        messageSchema.parse(body);

      const message = await communicationService.sendMessage(
        session.companyId,
        messageCode,
        senderId,
        recipientId,
        messageContent,
        messageType
      );

      return NextResponse.json(message, { status: 201 });
    } else if (action === 'publish-announcement') {
      const body = await request.json();
      const { announcementCode, announcementTitle, announcementContent, priority, targetAudience } =
        announcementSchema.parse(body);

      const announcement = await communicationService.publishAnnouncement(
        session.companyId,
        announcementCode,
        announcementTitle,
        announcementContent,
        priority,
        targetAudience
      );

      return NextResponse.json(announcement, { status: 201 });
    } else if (action === 'create-channel') {
      const body = await request.json();
      const { channelCode, channelName, channelType, description } = channelSchema.parse(body);

      const channel = await communicationService.createChannel(
        session.companyId,
        channelCode,
        channelName,
        channelType,
        description
      );

      return NextResponse.json(channel, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing communication action:', error);
    return NextResponse.json(
      { error: 'Failed to process communication action' },
      { status: 500 }
    );
  }
}

