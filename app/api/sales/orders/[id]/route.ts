import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSalesOrderSchema = z.object({
  orderNumber: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "SALES_ORDER", "READ");

    const order = await prisma.salesOrder.findUnique({
      where: { id: params.id },
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

    if (!order) throw ErrorCodes.NOT_FOUND("Sales order not found");
    checkGroupAccess(session, order.groupId);

    return NextResponse.json({ data: order });
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
    checkPermission(session, "SALES_ORDER", "UPDATE");

    const order = await prisma.salesOrder.findUnique({
      where: { id: params.id },
    });

    if (!order) throw ErrorCodes.NOT_FOUND("Sales order not found");
    checkGroupAccess(session, order.groupId);

    const body = await request.json();
    const data = updateSalesOrderSchema.parse(body);

    const updated = await prisma.salesOrder.update({
      where: { id: params.id },
      data: {
        orderNumber: data.orderNumber,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
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
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "SALES_ORDER", "DELETE");

    const order = await prisma.salesOrder.findUnique({
      where: { id: params.id },
    });

    if (!order) throw ErrorCodes.NOT_FOUND("Sales order not found");
    checkGroupAccess(session, order.groupId);

    // Delete associated items first
    await prisma.salesOrderItem.deleteMany({
      where: { orderId: params.id },
    });

    await prisma.salesOrder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

