import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const createCategorySchema = z.object({
  groupId: z.string(),
  name: z.string().min(1),
  code: z.string().min(1),
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

    const categories = await prisma.category.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: categories });
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
    const data = createCategorySchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if code already exists
    const existing = await prisma.category.findUnique({
      where: {
        groupId_code: {
          groupId: data.groupId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw ErrorCodes.CONFLICT("Category code already exists");
    }

    const category = await prisma.category.create({ data });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

