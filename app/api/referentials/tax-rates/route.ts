import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const prisma = new PrismaClient();

const createTaxRateSchema = z.object({
  groupId: z.string(),
  name: z.string().min(1),
  code: z.string().min(1),
  rate: z.string().transform((v) => parseFloat(v)),
  type: z.enum(["TVA", "TSP"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "READ");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) throw ErrorCodes.VALIDATION_ERROR("groupId is required");

    checkGroupAccess(session, groupId);

    const taxRates = await prisma.taxRate.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: taxRates });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "PRODUCT", "CREATE");

    const body = await request.json();
    const data = createTaxRateSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if code already exists
    const existing = await prisma.taxRate.findUnique({
      where: {
        groupId_code: {
          groupId: data.groupId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw ErrorCodes.CONFLICT("Tax rate code already exists");
    }

    const taxRate = await prisma.taxRate.create({ data });

    return NextResponse.json({ data: taxRate }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

