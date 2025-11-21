import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSalesOrderSchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  clientId: z.string(),
  orderNumber: z.string(),
  orderDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "SALES_ORDER", "READ");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const companyId = searchParams.get("companyId");

    if (!groupId || !companyId) {
      throw ErrorCodes.VALIDATION_ERROR("groupId and companyId are required");
    }

    checkGroupAccess(session, groupId);

    const orders = await prisma.salesOrder.findMany({
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

    return NextResponse.json({ data: orders });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "SALES_ORDER", "CREATE");

    const body = await request.json();
    const data = createSalesOrderSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw ErrorCodes.NOT_FOUND("Client not found");
    }

    // Check order number uniqueness
    const existingOrder = await prisma.salesOrder.findFirst({
      where: {
        groupId: data.groupId,
        orderNumber: data.orderNumber,
      },
    });

    if (existingOrder) {
      throw ErrorCodes.CONFLICT("Order number already exists");
    }

    const order = await prisma.salesOrder.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        clientId: data.clientId,
        orderNumber: data.orderNumber,
        orderDate: new Date(data.orderDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status,
        notes: data.notes,
        totalAmount: 0,
        totalTax: 0,
      },
      include: {
        client: true,
        items: true,
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

