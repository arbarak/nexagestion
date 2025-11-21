import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const prisma = new PrismaClient();

const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  ice: z.string().optional(),
  if: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "SUPPLIER", "READ");

    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
    });

    if (!supplier) throw ErrorCodes.NOT_FOUND("Supplier not found");

    checkGroupAccess(session, supplier.groupId);

    return NextResponse.json({ data: supplier });
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

    checkPermission(session, "SUPPLIER", "UPDATE");

    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
    });

    if (!supplier) throw ErrorCodes.NOT_FOUND("Supplier not found");

    checkGroupAccess(session, supplier.groupId);

    const body = await request.json();
    const data = updateSupplierSchema.parse(body);

    const updated = await prisma.supplier.update({
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

    checkPermission(session, "SUPPLIER", "DELETE");

    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
    });

    if (!supplier) throw ErrorCodes.NOT_FOUND("Supplier not found");

    checkGroupAccess(session, supplier.groupId);

    await prisma.supplier.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

