import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const prisma = new PrismaClient();

const createClientSchema = z.object({
  groupId: z.string(),
  name: z.string().min(1),
  code: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  ice: z.string().optional(),
  if: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "CLIENT", "READ");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) throw ErrorCodes.VALIDATION_ERROR("groupId is required");

    checkGroupAccess(session, groupId);

    const clients = await prisma.client.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: clients });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "CLIENT", "CREATE");

    const body = await request.json();
    const data = createClientSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if code already exists
    const existing = await prisma.client.findUnique({
      where: {
        groupId_code: {
          groupId: data.groupId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw ErrorCodes.CONFLICT("Client code already exists");
    }

    const client = await prisma.client.create({ data });

    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

