import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createWebhookSchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  name: z.string(),
  url: z.string().url(),
  events: z.array(z.string()),
  active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "WEBHOOKS", "READ");

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    checkGroupAccess(session, companyId);

    const webhooks = await prisma.webhook.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: webhooks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "WEBHOOKS", "CREATE");

    const body = await request.json();
    const data = createWebhookSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    const webhook = await prisma.webhook.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        name: data.name,
        url: data.url,
        events: data.events,
        active: data.active,
        secret: Math.random().toString(36).substring(2, 15),
      },
    });

    return NextResponse.json({ data: webhook }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
