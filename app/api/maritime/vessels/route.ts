import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createVesselSchema = z.object({
  groupId: z.string(),
  vesselName: z.string(),
  imoNumber: z.string(),
  vesselType: z.enum(["CONTAINER", "BULK", "TANKER", "GENERAL", "RO_RO"]),
  flag: z.string(),
  grossTonnage: z.number().positive(),
  netTonnage: z.number().positive(),
  deadweightTonnage: z.number().positive(),
  yearBuilt: z.number(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "RETIRED"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "MARITIME", "READ");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      throw ErrorCodes.VALIDATION_ERROR("groupId is required");
    }

    checkGroupAccess(session, groupId);

    const vessels = await prisma.vessel.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: vessels });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "BOAT", "CREATE");

    const body = await request.json();
    const data = createVesselSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check IMO number uniqueness
    const existingVessel = await prisma.vessel.findFirst({
      where: {
        groupId: data.groupId,
        imoNumber: data.imoNumber,
      },
    });

    if (existingVessel) {
      throw ErrorCodes.CONFLICT("Vessel with this IMO number already exists");
    }

    const vessel = await prisma.vessel.create({
      data: {
        groupId: data.groupId,
        vesselName: data.vesselName,
        imoNumber: data.imoNumber,
        vesselType: data.vesselType,
        flag: data.flag,
        grossTonnage: data.grossTonnage,
        netTonnage: data.netTonnage,
        deadweightTonnage: data.deadweightTonnage,
        yearBuilt: data.yearBuilt,
        status: data.status,
      },
    });

    return NextResponse.json({ data: vessel }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

