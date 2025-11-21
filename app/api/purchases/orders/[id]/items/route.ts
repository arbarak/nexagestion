import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  taxRateId: z.string().optional(),
  discount: z.number().min(0).max(100).optional(),
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
    });

    if (!order) throw ErrorCodes.NOT_FOUND("Purchase order not found");
    checkGroupAccess(session, order.groupId);

    const items = await prisma.purchaseOrderItem.findMany({
      where: { orderId: params.id },
      include: {
        product: true,
        taxRate: true,
      },
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
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
    const data = createItemSchema.parse(body);

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) throw ErrorCodes.NOT_FOUND("Product not found");

    const taxRate = data.taxRateId
      ? await prisma.taxRate.findUnique({
          where: { id: data.taxRateId },
        })
      : null;

    const subtotal = data.quantity * data.unitPrice;
    const discountAmount = (subtotal * (data.discount || 0)) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxRate ? (taxableAmount * taxRate.rate) / 100 : 0;
    const totalAmount = taxableAmount + taxAmount;

    const item = await prisma.purchaseOrderItem.create({
      data: {
        orderId: params.id,
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        taxRateId: data.taxRateId,
        discount: data.discount || 0,
        subtotal,
        taxAmount,
        totalAmount,
      },
      include: {
        product: true,
        taxRate: true,
      },
    });

    // Update order totals
    const allItems = await prisma.purchaseOrderItem.findMany({
      where: { orderId: params.id },
    });

    const totalAmount_all = allItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalTax_all = allItems.reduce((sum, item) => sum + item.taxAmount, 0);

    await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: {
        totalAmount: totalAmount_all,
        totalTax: totalTax_all,
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

