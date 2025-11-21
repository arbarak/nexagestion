import { NextRequest, NextResponse } from 'next/server';
import { securityService } from '@/lib/security-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const policySchema = z.object({
  name: z.string(),
  description: z.string(),
  passwordMinLength: z.number().optional(),
  passwordRequireUppercase: z.boolean().optional(),
  passwordRequireNumbers: z.boolean().optional(),
  passwordRequireSpecialChars: z.boolean().optional(),
  sessionTimeout: z.number().optional(),
  mfaRequired: z.boolean().optional(),
  ipWhitelistEnabled: z.boolean().optional(),
  ipWhitelist: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'policy') {
      const policy = await securityService.getSecurityPolicy(session.companyId);
      return NextResponse.json(policy || {});
    } else if (action === 'metrics') {
      const metrics = await securityService.getSecurityMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching security data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security data' },
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
    const { name, description, ...options } = policySchema.parse(body);

    const policy = await securityService.createSecurityPolicy(
      session.companyId,
      name,
      description,
      options
    );

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Error creating security policy:', error);
    return NextResponse.json(
      { error: 'Failed to create security policy' },
      { status: 500 }
    );
  }
}


