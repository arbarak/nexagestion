import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPurchaseInvoiceSchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  supplierId: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  status: z.enum(["DRAFT", "RECEIVED", "APPROVED", "PAID", "CANCELLED"]),
  notes: z.string().optional(),
  purchaseOrderId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "INVOICE", "READ");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const companyId = searchParams.get("companyId");

    if (!groupId || !companyId) {
      throw ErrorCodes.VALIDATION_ERROR("groupId and companyId are required");
    }

    checkGroupAccess(session, groupId);

    const invoices = await prisma.purchaseInvoice.findMany({
      where: {
        groupId,
        companyId,
      },
      include: {
        supplier: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: invoices });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "INVOICE", "CREATE");

    const body = await request.json();
    const data = createPurchaseInvoiceSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier) {
      throw ErrorCodes.NOT_FOUND("Supplier not found");
    }

    // Check invoice number uniqueness
    const existingInvoice = await prisma.purchaseInvoice.findFirst({
      where: {
        groupId: data.groupId,
        invoiceNumber: data.invoiceNumber,
      },
    });

    if (existingInvoice) {
      throw ErrorCodes.CONFLICT("Invoice number already exists");
    }

    const invoice = await prisma.purchaseInvoice.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        supplierId: data.supplierId,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: new Date(data.dueDate),
        status: data.status,
        notes: data.notes,
        purchaseOrderId: data.purchaseOrderId,
        totalAmount: 0,
        totalTax: 0,
        paidAmount: 0,
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

