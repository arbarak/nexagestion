import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateApiKeySchema = z.object({
  name: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "COMPANY", "READ");

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        permissions: true,
        active: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    if (!apiKey) throw ErrorCodes.NOT_FOUND("API Key not found");

    return NextResponse.json({ data: apiKey });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "COMPANY", "UPDATE");

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey) throw ErrorCodes.NOT_FOUND("API Key not found");

    const body = await request.json();
    const data = updateApiKeySchema.parse(body);

    const updated = await prisma.apiKey.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        permissions: true,
        active: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "COMPANY", "DELETE");

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey) throw ErrorCodes.NOT_FOUND("API Key not found");

    await prisma.apiKey.delete({ where: { id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

