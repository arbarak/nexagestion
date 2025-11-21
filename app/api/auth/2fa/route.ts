import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateOTP } from '@/lib/encryption';
import { z } from 'zod';

const enable2FASchema = z.object({
  method: z.enum(['email', 'sms', 'authenticator']),
});

const verify2FASchema = z.object({
  code: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { method } = enable2FASchema.parse(body);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await prisma.twoFactorAuth.create({
      data: {
        userId: session.userId,
        method,
        code: otp,
        expiresAt,
        verified: false,
      },
    });

    // In production, send OTP via email/SMS
    console.log(`2FA OTP for ${method}: ${otp}`);

    return NextResponse.json({
      message: `2FA code sent via ${method}`,
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = verify2FASchema.parse(body);

    // Find and verify OTP
    const twoFA = await prisma.twoFactorAuth.findFirst({
      where: {
        userId: session.userId,
        code,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!twoFA) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Mark as verified
    await prisma.twoFactorAuth.update({
      where: { id: twoFA.id },
      data: { verified: true },
    });

    // Update user 2FA status
    await prisma.user.update({
      where: { id: session.userId },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Failed to verify 2FA:', error);
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: session.userId },
      data: { twoFactorEnabled: false },
    });

    // Delete all 2FA records
    await prisma.twoFactorAuth.deleteMany({
      where: { userId: session.userId },
    });

    return NextResponse.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}

