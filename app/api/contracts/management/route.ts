import { NextRequest, NextResponse } from 'next/server';
import { contractManagementService } from '@/lib/contract-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const contractSchema = z.object({
  contractCode: z.string(),
  contractName: z.string(),
  contractType: z.enum(['vendor', 'client', 'employee', 'service', 'lease']),
  counterparty: z.string(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  value: z.number(),
});

const clauseSchema = z.object({
  contractId: z.string(),
  clauseCode: z.string(),
  clauseName: z.string(),
  description: z.string(),
  clauseType: z.enum(['payment', 'termination', 'liability', 'confidentiality', 'other']),
});

const renewalSchema = z.object({
  contractId: z.string(),
  renewalCode: z.string(),
  renewalDate: z.string().transform((s) => new Date(s)),
  newEndDate: z.string().transform((s) => new Date(s)),
  renewalTerms: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'contracts') {
      const status = searchParams.get('status');
      const contracts = await contractManagementService.getContracts(
        session.companyId,
        status || undefined
      );
      return NextResponse.json(contracts);
    } else if (action === 'clauses') {
      const contractId = searchParams.get('contractId');
      const clauses = await contractManagementService.getContractClauses(contractId || undefined);
      return NextResponse.json(clauses);
    } else if (action === 'metrics') {
      const metrics = await contractManagementService.getContractMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching contract data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract data' },
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

    if (action === 'create-contract') {
      const body = await request.json();
      const { contractCode, contractName, contractType, counterparty, startDate, endDate, value } =
        contractSchema.parse(body);

      const contract = await contractManagementService.createContract(
        session.companyId,
        contractCode,
        contractName,
        contractType,
        counterparty,
        startDate,
        endDate,
        value
      );

      return NextResponse.json(contract, { status: 201 });
    } else if (action === 'activate-contract') {
      const body = await request.json();
      const { contractId } = z.object({ contractId: z.string() }).parse(body);

      const contract = await contractManagementService.activateContract(contractId);
      if (!contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

      return NextResponse.json(contract);
    } else if (action === 'add-clause') {
      const body = await request.json();
      const { contractId, clauseCode, clauseName, description, clauseType } =
        clauseSchema.parse(body);

      const clause = await contractManagementService.addClause(
        contractId,
        clauseCode,
        clauseName,
        description,
        clauseType
      );

      return NextResponse.json(clause, { status: 201 });
    } else if (action === 'create-renewal') {
      const body = await request.json();
      const { contractId, renewalCode, renewalDate, newEndDate, renewalTerms } =
        renewalSchema.parse(body);

      const renewal = await contractManagementService.createRenewal(
        contractId,
        renewalCode,
        renewalDate,
        newEndDate,
        renewalTerms
      );

      return NextResponse.json(renewal, { status: 201 });
    } else if (action === 'approve-renewal') {
      const body = await request.json();
      const { renewalId, approvedBy } = z
        .object({ renewalId: z.string(), approvedBy: z.string() })
        .parse(body);

      const renewal = await contractManagementService.approveRenewal(renewalId, approvedBy);
      if (!renewal) {
        return NextResponse.json({ error: 'Renewal not found' }, { status: 404 });
      }

      return NextResponse.json(renewal);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing contract action:', error);
    return NextResponse.json(
      { error: 'Failed to process contract action' },
      { status: 500 }
    );
  }
}

