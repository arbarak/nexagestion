import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePurchaseOrderSchema = z.object({
  orderNumber: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "RECEIVED", "INVOICED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "PURCHASE_ORDER", "READ");

    const order = await prisma.purchaseOrder.findUnique({
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

    if (!order) throw ErrorCodes.NOT_FOUND("Purchase order not found");
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
    checkPermission(session, "PURCHASE_ORDER", "UPDATE");

    const order = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
    });

    if (!order) throw ErrorCodes.NOT_FOUND("Purchase order not found");
    checkGroupAccess(session, order.groupId);

    const body = await request.json();
    const data = updatePurchaseOrderSchema.parse(body);

    const updated = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: {
        orderNumber: data.orderNumber,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
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
    checkPermission(session, "PURCHASE_ORDER", "DELETE");

    const order = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
    });

    if (!order) throw ErrorCodes.NOT_FOUND("Purchase order not found");
    checkGroupAccess(session, order.groupId);

    // Delete associated items first
    await prisma.purchaseOrderItem.deleteMany({
      where: { orderId: params.id },
    });

    await prisma.purchaseOrder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

