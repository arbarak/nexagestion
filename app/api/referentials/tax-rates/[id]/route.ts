import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const prisma = new PrismaClient();

const updateTaxRateSchema = z.object({
  name: z.string().min(1).optional(),
  rate: z.string().transform((v) => parseFloat(v)).optional(),
  type: z.enum(["TVA", "TSP"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "READ");

    const taxRate = await prisma.taxRate.findUnique({
      where: { id: params.id },
    });

    if (!taxRate) throw ErrorCodes.NOT_FOUND("Tax rate not found");

    checkGroupAccess(session, taxRate.groupId);

    return NextResponse.json({ data: taxRate });
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

    const taxRate = await prisma.taxRate.findUnique({
      where: { id: params.id },
    });

    if (!taxRate) throw ErrorCodes.NOT_FOUND("Tax rate not found");

    checkGroupAccess(session, taxRate.groupId);

    const body = await request.json();
    const data = updateTaxRateSchema.parse(body);

    const updated = await prisma.taxRate.update({
      where: { id: params.id },
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
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "DELETE");

    const taxRate = await prisma.taxRate.findUnique({
      where: { id: params.id },
    });

    if (!taxRate) throw ErrorCodes.NOT_FOUND("Tax rate not found");

    checkGroupAccess(session, taxRate.groupId);

    await prisma.taxRate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Tax rate deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

