import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCargoSchema = z.object({
  groupId: z.string(),
  voyageId: z.string(),
  cargoNumber: z.string(),
  description: z.string(),
  weight: z.number().positive(),
  volume: z.number().positive(),
  cargoType: z.enum(["CONTAINER", "BREAKBULK", "LIQUID", "VEHICLE", "PROJECT"]),
  shipper: z.string(),
  consignee: z.string(),
  status: z.enum(["LOADED", "IN_TRANSIT", "ARRIVED", "DELIVERED", "DAMAGED"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "BOAT", "READ");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const voyageId = searchParams.get("voyageId");

    if (!groupId) {
      throw ErrorCodes.VALIDATION_ERROR("groupId is required");
    }

    checkGroupAccess(session, groupId);

    const cargo = await prisma.cargo.findMany({
      where: {
        groupId,
        ...(voyageId && { voyageId }),
      },
      include: {
        voyage: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: cargo });
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
    const data = createCargoSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if voyage exists
    const voyage = await prisma.voyage.findUnique({
      where: { id: data.voyageId },
    });

    if (!voyage) {
      throw ErrorCodes.NOT_FOUND("Voyage not found");
    }

    // Check cargo number uniqueness
    const existingCargo = await prisma.cargo.findFirst({
      where: {
        groupId: data.groupId,
        cargoNumber: data.cargoNumber,
      },
    });

    if (existingCargo) {
      throw ErrorCodes.CONFLICT("Cargo number already exists");
    }

    const cargo = await prisma.cargo.create({
      data: {
        groupId: data.groupId,
        voyageId: data.voyageId,
        cargoNumber: data.cargoNumber,
        description: data.description,
        weight: data.weight,
        volume: data.volume,
        cargoType: data.cargoType,
        shipper: data.shipper,
        consignee: data.consignee,
        status: data.status,
      },
      include: {
        voyage: true,
      },
    });

    return NextResponse.json({ data: cargo }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

