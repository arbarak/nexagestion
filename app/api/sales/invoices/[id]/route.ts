import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSalesInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "ISSUED", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  paidAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "INVOICE", "READ");

    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: id },
      include: {
        client: true,
        items: {
          include: {
            product: true,
            taxRate: true,
          },
        },
      },
    });

    if (!invoice) throw ErrorCodes.NOT_FOUND("Sales invoice not found");
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
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "INVOICE", "UPDATE");

    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: id },
    });

    if (!invoice) throw ErrorCodes.NOT_FOUND("Sales invoice not found");
    checkGroupAccess(session, invoice.groupId);

    const body = await request.json();
    const data = updateSalesInvoiceSchema.parse(body);

    const updated = await prisma.salesInvoice.update({
      where: { id: id },
      data: {
        invoiceNumber: data.invoiceNumber,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
        paidAmount: data.paidAmount,
        notes: data.notes,
      },
      include: {
        client: true,
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
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "INVOICE", "DELETE");

    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: id },
    });

    if (!invoice) throw ErrorCodes.NOT_FOUND("Sales invoice not found");
    checkGroupAccess(session, invoice.groupId);

    // Delete associated items first
    await prisma.salesInvoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    await prisma.salesInvoice.delete({
      where: { id: id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

