import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAuditLogSchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  userId: z.string(),
  action: z.string(),
  module: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  changes: z.record(z.any()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "REPORT", "READ");

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    // checkGroupAccess(session, session.groupId);

    const logs = await prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { id: true, email: true } } },
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    const body = await request.json();
    const data = createAuditLogSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    const log = await prisma.auditLog.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        userId: data.userId,
        action: data.action,
        module: data.module,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    return NextResponse.json({ data: log }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

