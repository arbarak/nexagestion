import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createStockSchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  productId: z.string(),
  quantity: z.number().min(0),
  warehouseLocation: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "INVENTORY", "READ");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const companyId = searchParams.get("companyId");

    if (!groupId || !companyId) {
      throw ErrorCodes.VALIDATION_ERROR("groupId and companyId are required");
    }

    checkGroupAccess(session, groupId);

    const stock = await prisma.stock.findMany({
      where: {
        groupId,
        companyId,
      },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: stock });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "INVENTORY", "CREATE");

    const body = await request.json();
    const data = createStockSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw ErrorCodes.NOT_FOUND("Product not found");
    }

    // Check if stock already exists for this product
    const existingStock = await prisma.stock.findFirst({
      where: {
        groupId: data.groupId,
        companyId: data.companyId,
        productId: data.productId,
      },
    });

    if (existingStock) {
      // Update existing stock
      const updated = await prisma.stock.update({
        where: { id: existingStock.id },
        data: {
          quantity: data.quantity,
          warehouseLocation: data.warehouseLocation,
        },
        include: {
          product: true,
        },
      });
      return NextResponse.json({ data: updated });
    }

    const stock = await prisma.stock.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        productId: data.productId,
        quantity: data.quantity,
        warehouseLocation: data.warehouseLocation,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ data: stock }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

