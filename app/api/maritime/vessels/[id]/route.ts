import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateVesselSchema = z.object({
  vesselName: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "RETIRED"]).optional(),
  flag: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "BOAT", "READ");

    const vessel = await prisma.vessel.findUnique({
      where: { id: params.id },
      include: {
        voyages: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!vessel) throw ErrorCodes.NOT_FOUND("Vessel not found");
    checkGroupAccess(session, vessel.groupId);

    return NextResponse.json({ data: vessel });
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

    const vessel = await prisma.vessel.findUnique({
      where: { id: params.id },
    });

    if (!vessel) throw ErrorCodes.NOT_FOUND("Vessel not found");
    checkGroupAccess(session, vessel.groupId);

    const body = await request.json();
    const data = updateVesselSchema.parse(body);

    const updated = await prisma.vessel.update({
      where: { id: params.id },
      data: {
        vesselName: data.vesselName,
        status: data.status,
        flag: data.flag,
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

    const vessel = await prisma.vessel.findUnique({
      where: { id: params.id },
    });

    if (!vessel) throw ErrorCodes.NOT_FOUND("Vessel not found");
    checkGroupAccess(session, vessel.groupId);

    // Delete associated voyages first
    await prisma.voyage.deleteMany({
      where: { vesselId: params.id },
    });

    await prisma.vessel.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

