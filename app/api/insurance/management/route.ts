import { NextRequest, NextResponse } from 'next/server';
import { insuranceManagementService } from '@/lib/insurance-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const policySchema = z.object({
  policyCode: z.string(),
  policyName: z.string(),
  insuranceType: z.enum(['liability', 'property', 'health', 'cyber', 'directors-officers']),
  provider: z.string(),
  coverageAmount: z.number(),
  premium: z.number(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
});

const claimSchema = z.object({
  policyId: z.string(),
  claimCode: z.string(),
  claimName: z.string(),
  claimDate: z.string().transform((s) => new Date(s)),
  claimAmount: z.number(),
  description: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'policies') {
      const status = searchParams.get('status');
      const policies = await insuranceManagementService.getPolicies(
        session.companyId,
        status || undefined
      );
      return NextResponse.json(policies);
    } else if (action === 'claims') {
      const policyId = searchParams.get('policyId');
      const claims = await insuranceManagementService.getClaims(policyId || undefined);
      return NextResponse.json(claims);
    } else if (action === 'metrics') {
      const metrics = await insuranceManagementService.getInsuranceMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching insurance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance data' },
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

    if (action === 'create-policy') {
      const body = await request.json();
      const {
        policyCode,
        policyName,
        insuranceType,
        provider,
        coverageAmount,
        premium,
        startDate,
        endDate,
      } = policySchema.parse(body);

      const policy = await insuranceManagementService.createPolicy(
        session.companyId,
        policyCode,
        policyName,
        insuranceType,
        provider,
        coverageAmount,
        premium,
        startDate,
        endDate
      );

      return NextResponse.json(policy, { status: 201 });
    } else if (action === 'file-claim') {
      const body = await request.json();
      const { policyId, claimCode, claimName, claimDate, claimAmount, description } =
        claimSchema.parse(body);

      const claim = await insuranceManagementService.fileClaim(
        policyId,
        claimCode,
        claimName,
        claimDate,
        claimAmount,
        description
      );

      return NextResponse.json(claim, { status: 201 });
    } else if (action === 'approve-claim') {
      const body = await request.json();
      const { claimId, approvedAmount } = z
        .object({ claimId: z.string(), approvedAmount: z.number() })
        .parse(body);

      const claim = await insuranceManagementService.approveClaim(claimId, approvedAmount);
      if (!claim) {
        return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
      }

      return NextResponse.json(claim);
    } else if (action === 'reject-claim') {
      const body = await request.json();
      const { claimId } = z.object({ claimId: z.string() }).parse(body);

      const claim = await insuranceManagementService.rejectClaim(claimId);
      if (!claim) {
        return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
      }

      return NextResponse.json(claim);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing insurance action:', error);
    return NextResponse.json(
      { error: 'Failed to process insurance action' },
      { status: 500 }
    );
  }
}


