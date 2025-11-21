import { NextRequest, NextResponse } from 'next/server';
import { procurementService } from '@/lib/procurement-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const poItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
});

const poSchema = z.object({
  poNumber: z.string(),
  vendorId: z.string(),
  items: z.array(poItemSchema),
});

const goodsReceiptSchema = z.object({
  poId: z.string(),
  receiptNumber: z.string(),
  receivedQuantity: z.number(),
});

const invoiceSchema = z.object({
  poId: z.string(),
  invoiceNumber: z.string(),
  vendorId: z.string(),
  amount: z.number(),
  dueDate: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'purchase-orders') {
      const status = searchParams.get('status');
      const orders = await procurementService.getPurchaseOrders(session.companyId, status || undefined);
      return NextResponse.json(orders);
    } else if (action === 'invoices') {
      const vendorId = searchParams.get('vendorId');
      const status = searchParams.get('status');
      const invoices = await procurementService.getInvoices(vendorId || undefined, status || undefined);
      return NextResponse.json(invoices);
    } else if (action === 'metrics') {
      const metrics = await procurementService.getProcurementMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching procurement data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch procurement data' },
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

    if (action === 'create-po') {
      const body = await request.json();
      const { poNumber, vendorId, items } = poSchema.parse(body);

      const po = await procurementService.createPurchaseOrder(
        session.companyId,
        poNumber,
        vendorId,
        items
      );

      return NextResponse.json(po, { status: 201 });
    } else if (action === 'send-po') {
      const body = await request.json();
      const { poId } = z.object({ poId: z.string() }).parse(body);

      const po = await procurementService.sendPurchaseOrder(poId);
      if (!po) {
        return NextResponse.json({ error: 'PO not found' }, { status: 404 });
      }

      return NextResponse.json(po);
    } else if (action === 'receive-goods') {
      const body = await request.json();
      const { poId, receiptNumber, receivedQuantity } = goodsReceiptSchema.parse(body);

      const receipt = await procurementService.receiveGoods(poId, receiptNumber, receivedQuantity);
      return NextResponse.json(receipt, { status: 201 });
    } else if (action === 'create-invoice') {
      const body = await request.json();
      const { poId, invoiceNumber, vendorId, amount, dueDate } = invoiceSchema.parse(body);

      const invoice = await procurementService.createInvoice(
        poId,
        invoiceNumber,
        vendorId,
        amount,
        new Date(dueDate)
      );

      return NextResponse.json(invoice, { status: 201 });
    } else if (action === 'approve-invoice') {
      const body = await request.json();
      const { invoiceId } = z.object({ invoiceId: z.string() }).parse(body);

      const invoice = await procurementService.approveInvoice(invoiceId);
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
    console.error('Error processing procurement action:', error);
    return NextResponse.json(
      { error: 'Failed to process procurement action' },
      { status: 500 }
    );
  }
}


