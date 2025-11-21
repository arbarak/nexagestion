import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateWebhookSchema = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "WEBHOOKS", "READ");

    const webhook = await prisma.webhook.findUnique({
      where: { id: params.id },
      include: { deliveries: { take: 10, orderBy: { createdAt: "desc" } } },
    });

    if (!webhook) throw ErrorCodes.NOT_FOUND("Webhook not found");

    checkGroupAccess(session, webhook.groupId);

    return NextResponse.json({ data: webhook });
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
    checkPermission(session, "WEBHOOKS", "UPDATE");

    const webhook = await prisma.webhook.findUnique({
      where: { id: params.id },
    });

    if (!webhook) throw ErrorCodes.NOT_FOUND("Webhook not found");

    checkGroupAccess(session, webhook.groupId);

    const body = await request.json();
    const data = updateWebhookSchema.parse(body);

    const updated = await prisma.webhook.update({
      where: { id: params.id },
      data,
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
    checkPermission(session, "WEBHOOKS", "DELETE");

    const webhook = await prisma.webhook.findUnique({
      where: { id: params.id },
    });

    if (!webhook) throw ErrorCodes.NOT_FOUND("Webhook not found");

    checkGroupAccess(session, webhook.groupId);

    await prisma.webhook.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

