import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  price: z.string().transform((v) => parseFloat(v)).optional(),
  cost: z.string().transform((v) => parseFloat(v)).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "READ");

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true, brand: true },
    });

    if (!product) throw ErrorCodes.NOT_FOUND("Product not found");

    checkGroupAccess(session, product.groupId);

    return NextResponse.json({ data: product });
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

    checkPermission(session, "PRODUCT", "UPDATE");

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) throw ErrorCodes.NOT_FOUND("Product not found");

    checkGroupAccess(session, product.groupId);

    const body = await request.json();
    const data = updateProductSchema.parse(body);

    const updated = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { category: true, brand: true },
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

    checkPermission(session, "PRODUCT", "DELETE");

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) throw ErrorCodes.NOT_FOUND("Product not found");

    checkGroupAccess(session, product.groupId);

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

