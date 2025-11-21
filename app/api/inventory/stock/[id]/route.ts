import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStockSchema = z.object({
  quantity: z.number().min(0).optional(),
  warehouseLocation: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "INVENTORY", "READ");

    const stock = await prisma.stock.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        movements: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!stock) throw ErrorCodes.NOT_FOUND("Stock not found");
    checkGroupAccess(session, stock.groupId);

    return NextResponse.json({ data: stock });
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
    checkPermission(session, "INVENTORY", "UPDATE");

    const stock = await prisma.stock.findUnique({
      where: { id: params.id },
    });

    if (!stock) throw ErrorCodes.NOT_FOUND("Stock not found");
    checkGroupAccess(session, stock.groupId);

    const body = await request.json();
    const data = updateStockSchema.parse(body);

    const updated = await prisma.stock.update({
      where: { id: params.id },
      data: {
        quantity: data.quantity,
        warehouseLocation: data.warehouseLocation,
      },
      include: {
        product: true,
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
    checkPermission(session, "INVENTORY", "DELETE");

    const stock = await prisma.stock.findUnique({
      where: { id: params.id },
    });

    if (!stock) throw ErrorCodes.NOT_FOUND("Stock not found");
    checkGroupAccess(session, stock.groupId);

    // Delete associated movements first
    await prisma.stockMovement.deleteMany({
      where: { stockId: params.id },
    });

    await prisma.stock.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

