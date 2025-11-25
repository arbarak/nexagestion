import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const createProductSchema = z.object({
  groupId: z.string(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  price: z.string().transform((v) => parseFloat(v)),
  cost: z.string().transform((v) => parseFloat(v)),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "READ");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) throw ErrorCodes.VALIDATION_ERROR("groupId is required");

    checkGroupAccess(session, groupId);

    const products = await prisma.product.findMany({
      where: { groupId },
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "CREATE");

    const body = await request.json();
    const data = createProductSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if code already exists
    const existing = await prisma.product.findUnique({
      where: {
        groupId_code: {
          groupId: data.groupId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw ErrorCodes.CONFLICT("Product code already exists");
    }

    const product = await prisma.product.create({
      data,
      include: { category: true, brand: true },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

