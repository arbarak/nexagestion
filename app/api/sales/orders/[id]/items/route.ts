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
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "SALE", "READ");

    const order = await prisma.salesOrder.findUnique({
      where: { id: id },
    });

    if (!order) throw ErrorCodes.NOT_FOUND("Sales order not found");
    checkGroupAccess(session, order.groupId);

    const items = await prisma.salesOrderItem.findMany({
      where: { orderId: id },
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
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "SALE", "UPDATE");

    const order = await prisma.salesOrder.findUnique({
      where: { id: id },
    });

    if (!order) throw ErrorCodes.NOT_FOUND("Sales order not found");
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
    const taxAmount = taxRate ? (taxableAmount * Number(taxRate.rate)) / 100 : 0;
    const totalAmount = taxableAmount + taxAmount;

    const item = await prisma.salesOrderItem.create({
      data: {
        orderId: id,
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
    const allItems = await prisma.salesOrderItem.findMany({
      where: { orderId: id },
    });

    const totalAmount_all = allItems.reduce(
      (sum: number, item: (typeof allItems)[number]) => sum + item.totalAmount,
      0
    );
    const totalTax_all = allItems.reduce(
      (sum: number, item: (typeof allItems)[number]) => sum + item.taxAmount,
      0
    );

    await prisma.salesOrder.update({
      where: { id: id },
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
