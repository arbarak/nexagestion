import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const prisma = new PrismaClient();

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "READ");

    const category = await prisma.category.findUnique({
      where: { id: id },
    });

    if (!category) throw ErrorCodes.NOT_FOUND("Category not found");

    checkGroupAccess(session, category.groupId);

    return NextResponse.json({ data: category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "UPDATE");

    const category = await prisma.category.findUnique({
      where: { id: id },
    });

    if (!category) throw ErrorCodes.NOT_FOUND("Category not found");

    checkGroupAccess(session, category.groupId);

    const body = await request.json();
    const data = updateCategorySchema.parse(body);

    const updated = await prisma.category.update({
      where: { id: id },
      data,
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
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "DELETE");

    const category = await prisma.category.findUnique({
      where: { id: id },
    });

    if (!category) throw ErrorCodes.NOT_FOUND("Category not found");

    checkGroupAccess(session, category.groupId);

    await prisma.category.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

