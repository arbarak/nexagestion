import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const createApiKeySchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  name: z.string(),
  permissions: z.array(z.string()),
});

function generateApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString("hex")}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "COMPANY", "READ");

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    checkGroupAccess(session, session.user.groupId);

    const apiKeys = await prisma.apiKey.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        permissions: true,
        active: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: apiKeys });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "COMPANY", "CREATE");

    const body = await request.json();
    const data = createApiKeySchema.parse(body);

    checkGroupAccess(session, data.groupId);

    const apiKey = generateApiKey();
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    const created = await prisma.apiKey.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        name: data.name,
        key: hashedKey,
        permissions: data.permissions,
        active: true,
      },
    });

    return NextResponse.json(
      {
        data: {
          ...created,
          key: apiKey, // Only return the unhashed key once
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}


