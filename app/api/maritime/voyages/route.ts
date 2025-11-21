import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createVoyageSchema = z.object({
  groupId: z.string(),
  vesselId: z.string(),
  voyageNumber: z.string(),
  departurePort: z.string(),
  arrivalPort: z.string(),
  departureDate: z.string().datetime(),
  estimatedArrivalDate: z.string().datetime(),
  actualArrivalDate: z.string().datetime().optional(),
  status: z.enum(["PLANNED", "IN_TRANSIT", "ARRIVED", "COMPLETED", "CANCELLED"]),
  cargoCapacity: z.number().positive(),
  cargoLoaded: z.number().min(0),
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

    const voyages = await prisma.voyage.findMany({
      where: { groupId },
      include: {
        vessel: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: voyages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "MARITIME", "CREATE");

    const body = await request.json();
    const data = createVoyageSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if vessel exists
    const vessel = await prisma.vessel.findUnique({
      where: { id: data.vesselId },
    });

    if (!vessel) {
      throw ErrorCodes.NOT_FOUND("Vessel not found");
    }

    // Check voyage number uniqueness
    const existingVoyage = await prisma.voyage.findFirst({
      where: {
        groupId: data.groupId,
        voyageNumber: data.voyageNumber,
      },
    });

    if (existingVoyage) {
      throw ErrorCodes.CONFLICT("Voyage number already exists");
    }

    const voyage = await prisma.voyage.create({
      data: {
        groupId: data.groupId,
        vesselId: data.vesselId,
        voyageNumber: data.voyageNumber,
        departurePort: data.departurePort,
        arrivalPort: data.arrivalPort,
        departureDate: new Date(data.departureDate),
        estimatedArrivalDate: new Date(data.estimatedArrivalDate),
        actualArrivalDate: data.actualArrivalDate ? new Date(data.actualArrivalDate) : null,
        status: data.status,
        cargoCapacity: data.cargoCapacity,
        cargoLoaded: data.cargoLoaded,
      },
      include: {
        vessel: true,
      },
    });

    return NextResponse.json({ data: voyage }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

