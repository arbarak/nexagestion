import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPurchaseOrderSchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  supplierId: z.string(),
  orderNumber: z.string(),
  orderDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "RECEIVED", "INVOICED", "CANCELLED"]),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "PURCHASE_ORDER", "READ");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const companyId = searchParams.get("companyId");

    if (!groupId || !companyId) {
      throw ErrorCodes.VALIDATION_ERROR("groupId and companyId are required");
    }

    checkGroupAccess(session, groupId);

    const orders = await prisma.purchaseOrder.findMany({
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

    return NextResponse.json({ data: orders });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "PURCHASE_ORDER", "CREATE");

    const body = await request.json();
    const data = createPurchaseOrderSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier) {
      throw ErrorCodes.NOT_FOUND("Supplier not found");
    }

    // Check order number uniqueness
    const existingOrder = await prisma.purchaseOrder.findFirst({
      where: {
        groupId: data.groupId,
        orderNumber: data.orderNumber,
      },
    });

    if (existingOrder) {
      throw ErrorCodes.CONFLICT("Order number already exists");
    }

    const order = await prisma.purchaseOrder.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        supplierId: data.supplierId,
        orderNumber: data.orderNumber,
        orderDate: new Date(data.orderDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status,
        notes: data.notes,
        totalAmount: 0,
        totalTax: 0,
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

