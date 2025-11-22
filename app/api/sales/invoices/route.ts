import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSalesInvoiceSchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  clientId: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  status: z.enum(["DRAFT", "ISSUED", "PAID", "OVERDUE", "CANCELLED"]),
  notes: z.string().optional(),
  salesOrderId: z.string().optional(),
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

    const invoices = await prisma.salesInvoice.findMany({
      where: {
        groupId,
        companyId,
      },
      include: {
        client: true,
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
    const data = createSalesInvoiceSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw ErrorCodes.NOT_FOUND("Client not found");
    }

    // Check invoice number uniqueness
    const existingInvoice = await prisma.salesInvoice.findFirst({
      where: {
        groupId: data.groupId,
        invoiceNumber: data.invoiceNumber,
      },
    });

    if (existingInvoice) {
      throw ErrorCodes.CONFLICT("Invoice number already exists");
    }

    const invoice = await prisma.salesInvoice.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: new Date(data.dueDate),
        status: data.status,
        notes: data.notes,
        salesOrderId: data.salesOrderId,
        totalAmount: 0,
        totalTax: 0,
        paidAmount: 0,
      },
      include: {
        client: true,
        items: true,
      },
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

