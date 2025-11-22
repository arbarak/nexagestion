import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateVoyageSchema = z.object({
  status: z.enum(["PLANNED", "IN_TRANSIT", "ARRIVED", "COMPLETED", "CANCELLED"]).optional(),
  actualArrivalDate: z.string().datetime().optional(),
  cargoLoaded: z.number().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "BOAT", "READ");

    const { id } = await params;
    const voyage = await prisma.voyage.findUnique({
      where: { id },
      include: {
        vessel: true,
        cargo: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!voyage) throw ErrorCodes.NOT_FOUND("Voyage not found");
    checkGroupAccess(session, voyage.groupId);

    return NextResponse.json({ data: voyage });
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

    const { id } = await params;
    const voyage = await prisma.voyage.findUnique({
      where: { id },
    });

    if (!voyage) throw ErrorCodes.NOT_FOUND("Voyage not found");
    checkGroupAccess(session, voyage.groupId);

    const body = await request.json();
    const data = updateVoyageSchema.parse(body);

    const updated = await prisma.voyage.update({
      where: { id },
      data: {
        status: data.status,
        actualArrivalDate: data.actualArrivalDate ? new Date(data.actualArrivalDate) : undefined,
        cargoLoaded: data.cargoLoaded,
      },
      include: {
        vessel: true,
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
    checkPermission(session, "BOAT", "DELETE");

    const { id } = await params;
    const voyage = await prisma.voyage.findUnique({
      where: { id },
    });

    if (!voyage) throw ErrorCodes.NOT_FOUND("Voyage not found");
    checkGroupAccess(session, voyage.groupId);

    // Delete associated cargo first
    await prisma.cargo.deleteMany({
      where: { voyageId: id },
    });

    await prisma.voyage.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

