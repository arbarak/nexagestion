import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const pushNotificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.any()).optional(),
  targetUsers: z.array(z.string()).optional(),
  targetRole: z.string().optional(),
});

const deviceTokenSchema = z.object({
  token: z.string(),
  platform: z.enum(['ios', 'android', 'web']),
  deviceName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, body: messageBody, data, targetUsers, targetRole } = pushNotificationSchema.parse(body);

    // Find target users
    let users;
    if (targetUsers && targetUsers.length > 0) {
      users = await prisma.user.findMany({
        where: { id: { in: targetUsers }, companyId: session.companyId },
      });
    } else if (targetRole) {
      users = await prisma.user.findMany({
        where: { role: targetRole, companyId: session.companyId },
      });
    } else {
      users = await prisma.user.findMany({
        where: { companyId: session.companyId },
      });
    }

    // Create notifications for each user
    const notifications = await Promise.all(
      users.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            title,
            body: messageBody,
            data: data || {},
            type: 'push',
            read: false,
          },
        })
      )
    );

    // In production, send actual push notifications via FCM, APNs, etc.
    console.log(`Sent ${notifications.length} push notifications`);

    return NextResponse.json({
      message: `Push notification sent to ${notifications.length} users`,
      notificationCount: notifications.length,
    });
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return NextResponse.json({ error: 'Failed to send push notification' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, platform, deviceName } = deviceTokenSchema.parse(body);

    // Store device token
    const deviceToken = await prisma.deviceToken.upsert({
      where: { token },
      update: { lastUsedAt: new Date() },
      create: {
        userId: session.userId,
        token,
        platform,
        deviceName: deviceName || `${platform} device`,
      },
    });

    return NextResponse.json(deviceToken);
  } catch (error) {
    console.error('Failed to register device token:', error);
    return NextResponse.json({ error: 'Failed to register device token' }, { status: 500 });
  }
}

