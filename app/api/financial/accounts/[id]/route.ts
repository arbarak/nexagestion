import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateAccountSchema = z.object({
  accountName: z.string().optional(),
  balance: z.number().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "FINANCIAL", "READ");

    const account = await prisma.account.findUnique({
      where: { id: params.id },
      include: { transactions: { take: 10, orderBy: { createdAt: "desc" } } },
    });

    if (!account) throw ErrorCodes.NOT_FOUND("Account not found");

    checkGroupAccess(session, account.groupId);

    return NextResponse.json({ data: account });
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
    checkPermission(session, "FINANCIAL", "UPDATE");

    const account = await prisma.account.findUnique({
      where: { id: params.id },
    });

    if (!account) throw ErrorCodes.NOT_FOUND("Account not found");

    checkGroupAccess(session, account.groupId);

    const body = await request.json();
    const data = updateAccountSchema.parse(body);

    const updated = await prisma.account.update({
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
    checkPermission(session, "FINANCIAL", "DELETE");

    const account = await prisma.account.findUnique({
      where: { id: params.id },
    });

    if (!account) throw ErrorCodes.NOT_FOUND("Account not found");

    checkGroupAccess(session, account.groupId);

    await prisma.account.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

