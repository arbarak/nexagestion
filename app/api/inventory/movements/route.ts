import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createMovementSchema = z.object({
  stockId: z.string(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.number().positive(),
  reference: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "STOCK", "READ");

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    const movements = await prisma.stockMovement.findMany({
      where: {
        stock: {
          companyId,
        },
      },
      include: {
        stock: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: movements });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "STOCK", "CREATE");

    const body = await request.json();
    const data = createMovementSchema.parse(body);


    const stock = await prisma.stock.findUnique({
      where: { id: data.stockId },
    });

    if (!stock) {
      throw ErrorCodes.NOT_FOUND("Stock not found");
    }

    // Create movement
    const movement = await prisma.stockMovement.create({
      data: {
        stockId: data.stockId,
        type: data.type,
        quantity: data.quantity,
        reference: data.reference,
      },
      include: {
        stock: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update stock quantity
    let newQuantity = Number(stock.quantity);
    if (data.type === "IN") {
      newQuantity += data.quantity;
    } else if (data.type === "OUT") {
      newQuantity -= data.quantity;
    } else if (data.type === "ADJUSTMENT") {
      newQuantity = data.quantity;
    }

    await prisma.stock.update({
      where: { id: data.stockId },
      data: { quantity: newQuantity },
    });

    return NextResponse.json({ data: movement }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

