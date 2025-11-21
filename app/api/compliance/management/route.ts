import { NextRequest, NextResponse } from 'next/server';
import { complianceManagementService } from '@/lib/compliance-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const policySchema = z.object({
  policyCode: z.string(),
  policyName: z.string(),
  description: z.string(),
  policyType: z.enum(['data-protection', 'labor', 'environmental', 'financial', 'health-safety']),
  effectiveDate: z.string().transform((s) => new Date(s)),
});

const auditSchema = z.object({
  auditCode: z.string(),
  auditName: z.string(),
  auditType: z.enum(['internal', 'external', 'regulatory']),
  auditDate: z.string().transform((s) => new Date(s)),
  auditor: z.string(),
});

const issueSchema = z.object({
  auditId: z.string(),
  issueCode: z.string(),
  issueName: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  dueDate: z.string().transform((s) => new Date(s)),
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
      const policies = await complianceManagementService.getPolicies(session.companyId);
      return NextResponse.json(policies);
    } else if (action === 'audits') {
      const audits = await complianceManagementService.getAudits(session.companyId);
      return NextResponse.json(audits);
    } else if (action === 'metrics') {
      const metrics = await complianceManagementService.getComplianceMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' },
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
      const { policyCode, policyName, description, policyType, effectiveDate } =
        policySchema.parse(body);

      const policy = await complianceManagementService.createPolicy(
        session.companyId,
        policyCode,
        policyName,
        description,
        policyType,
        effectiveDate
      );

      return NextResponse.json(policy, { status: 201 });
    } else if (action === 'create-audit') {
      const body = await request.json();
      const { auditCode, auditName, auditType, auditDate, auditor } = auditSchema.parse(body);

      const audit = await complianceManagementService.createAudit(
        session.companyId,
        auditCode,
        auditName,
        auditType,
        auditDate,
        auditor
      );

      return NextResponse.json(audit, { status: 201 });
    } else if (action === 'complete-audit') {
      const body = await request.json();
      const { auditId, findings } = z
        .object({ auditId: z.string(), findings: z.string() })
        .parse(body);

      const audit = await complianceManagementService.completeAudit(auditId, findings);
      if (!audit) {
        return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
      }

      return NextResponse.json(audit);
    } else if (action === 'create-issue') {
      const body = await request.json();
      const { auditId, issueCode, issueName, severity, description, dueDate } =
        issueSchema.parse(body);

      const issue = await complianceManagementService.createIssue(
        auditId,
        issueCode,
        issueName,
        severity,
        description,
        dueDate
      );

      return NextResponse.json(issue, { status: 201 });
    } else if (action === 'resolve-issue') {
      const body = await request.json();
      const { issueId } = z.object({ issueId: z.string() }).parse(body);

      const issue = await complianceManagementService.resolveIssue(issueId);
      if (!issue) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }

      return NextResponse.json(issue);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing compliance action:', error);
    return NextResponse.json(
      { error: 'Failed to process compliance action' },
      { status: 500 }
    );
  }
}


