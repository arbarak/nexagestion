import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCargoSchema = z.object({
  status: z.enum(["LOADED", "IN_TRANSIT", "ARRIVED", "DELIVERED", "DAMAGED"]).optional(),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "BOAT", "READ");

    const cargo = await prisma.cargo.findUnique({
      where: { id: params.id },
      include: {
        voyage: {
          include: {
            vessel: true,
          },
        },
      },
    });

    if (!cargo) throw ErrorCodes.NOT_FOUND("Cargo not found");
    checkGroupAccess(session, cargo.groupId);

    return NextResponse.json({ data: cargo });
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
    checkPermission(session, "BOAT", "UPDATE");

    const cargo = await prisma.cargo.findUnique({
      where: { id: params.id },
    });

    if (!cargo) throw ErrorCodes.NOT_FOUND("Cargo not found");
    checkGroupAccess(session, cargo.groupId);

    const body = await request.json();
    const data = updateCargoSchema.parse(body);

    const updated = await prisma.cargo.update({
      where: { id: params.id },
      data: {
        status: data.status,
        description: data.description,
      },
      include: {
        voyage: true,
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
    checkPermission(session, "MARITIME", "DELETE");

    const cargo = await prisma.cargo.findUnique({
      where: { id: params.id },
    });

    if (!cargo) throw ErrorCodes.NOT_FOUND("Cargo not found");
    checkGroupAccess(session, cargo.groupId);

    await prisma.cargo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

