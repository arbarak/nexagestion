import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const messageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  mentions: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { channelId, content, mentions, attachments } = messageSchema.parse(body);

    // Create chat message
    const message = await prisma.teamChatMessage.create({
      data: {
        channelId,
        userId: session.userId,
        content,
        mentions: mentions || [],
        attachments: attachments || [],
      },
    });

    // Notify mentioned users
    if (mentions && mentions.length > 0) {
      await prisma.notification.createMany({
        data: mentions.map(userId => ({
          userId,
          type: 'mention',
          title: 'You were mentioned in a chat',
          message: content.substring(0, 100),
          relatedId: message.id,
        })),
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
    }

    const messages = await prisma.teamChatMessage.findMany({
      where: { channelId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

