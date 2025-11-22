import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const prisma = new PrismaClient();

const updateBrandSchema = z.object({
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

    const brand = await prisma.brand.findUnique({
      where: { id: id },
    });

    if (!brand) throw ErrorCodes.NOT_FOUND("Brand not found");

    checkGroupAccess(session, brand.groupId);

    return NextResponse.json({ data: brand });
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

    const brand = await prisma.brand.findUnique({
      where: { id: id },
    });

    if (!brand) throw ErrorCodes.NOT_FOUND("Brand not found");

    checkGroupAccess(session, brand.groupId);

    const body = await request.json();
    const data = updateBrandSchema.parse(body);

    const updated = await prisma.brand.update({
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

    const brand = await prisma.brand.findUnique({
      where: { id: id },
    });

    if (!brand) throw ErrorCodes.NOT_FOUND("Brand not found");

    checkGroupAccess(session, brand.groupId);

    await prisma.brand.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

