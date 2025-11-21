import { NextRequest, NextResponse } from 'next/server';
import { accountingService } from '@/lib/accounting-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const accountSchema = z.object({
  accountCode: z.string(),
  accountName: z.string(),
  accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
});

const journalEntrySchema = z.object({
  description: z.string(),
  entries: z.array(z.object({
    accountId: z.string(),
    debit: z.number(),
    credit: z.number(),
  })),
});

const invoiceSchema = z.object({
  customerId: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })),
  tax: z.number(),
  dueDate: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'chart-of-accounts') {
      const accounts = await accountingService.getChartOfAccounts(session.companyId);
      return NextResponse.json(accounts);
    } else if (action === 'invoices') {
      const status = searchParams.get('status');
      const invoices = await accountingService.getInvoices(session.companyId, status || undefined);
      return NextResponse.json(invoices);
    } else if (action === 'metrics') {
      const metrics = await accountingService.getFinancialMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching accounting data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounting data' },
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

    if (action === 'create-account') {
      const body = await request.json();
      const { accountCode, accountName, accountType } = accountSchema.parse(body);

      const account = await accountingService.createAccount(
        session.companyId,
        accountCode,
        accountName,
        accountType
      );

      return NextResponse.json(account, { status: 201 });
    } else if (action === 'create-journal-entry') {
      const body = await request.json();
      const { description, entries } = journalEntrySchema.parse(body);

      const entry = await accountingService.createJournalEntry(
        session.companyId,
        description,
        entries
      );

      return NextResponse.json(entry, { status: 201 });
    } else if (action === 'post-journal-entry') {
      const body = await request.json();
      const { entryId } = z.object({ entryId: z.string() }).parse(body);

      const entry = await accountingService.postJournalEntry(entryId);
      if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }

      return NextResponse.json(entry);
    } else if (action === 'create-invoice') {
      const body = await request.json();
      const { customerId, items, tax, dueDate } = invoiceSchema.parse(body);

      const invoice = await accountingService.createInvoice(
        session.companyId,
        customerId,
        items,
        tax,
        new Date(dueDate)
      );

      return NextResponse.json(invoice, { status: 201 });
    } else if (action === 'send-invoice') {
      const body = await request.json();
      const { invoiceId } = z.object({ invoiceId: z.string() }).parse(body);

      const invoice = await accountingService.sendInvoice(invoiceId);
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      return NextResponse.json(invoice);
    } else if (action === 'mark-paid') {
      const body = await request.json();
      const { invoiceId } = z.object({ invoiceId: z.string() }).parse(body);

      const invoice = await accountingService.markInvoicePaid(invoiceId);
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      return NextResponse.json(invoice);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing accounting action:', error);
    return NextResponse.json(
      { error: 'Failed to process accounting action' },
      { status: 500 }
    );
  }
}

