import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePurchaseInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "RECEIVED", "APPROVED", "PAID", "CANCELLED"]).optional(),
  paidAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "PURCHASE_INVOICE", "READ");

    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id: params.id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            taxRate: true,
          },
        },
      },
    });

    if (!invoice) throw ErrorCodes.NOT_FOUND("Purchase invoice not found");
    checkGroupAccess(session, invoice.groupId);

    return NextResponse.json({ data: invoice });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "PURCHASE_INVOICE", "UPDATE");

    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) throw ErrorCodes.NOT_FOUND("Purchase invoice not found");
    checkGroupAccess(session, invoice.groupId);

    const body = await request.json();
    const data = updatePurchaseInvoiceSchema.parse(body);

    const updated = await prisma.purchaseInvoice.update({
      where: { id: params.id },
      data: {
        invoiceNumber: data.invoiceNumber,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
        paidAmount: data.paidAmount,
        notes: data.notes,
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "PURCHASE_INVOICE", "DELETE");

    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) throw ErrorCodes.NOT_FOUND("Purchase invoice not found");
    checkGroupAccess(session, invoice.groupId);

    // Delete associated items first
    await prisma.purchaseInvoiceItem.deleteMany({
      where: { invoiceId: params.id },
    });

    await prisma.purchaseInvoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

