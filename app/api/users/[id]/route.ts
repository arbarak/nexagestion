import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "STOCK", "ACCOUNTANT", "VIEWER"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "USERS", "READ");

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        groupId: true,
        createdAt: true,
      },
    });

    if (!user) throw ErrorCodes.NOT_FOUND("User not found");

    checkGroupAccess(session, user.groupId);

    return NextResponse.json({ data: user });
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
    checkPermission(session, "USERS", "UPDATE");

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) throw ErrorCodes.NOT_FOUND("User not found");

    checkGroupAccess(session, user.groupId);

    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
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
    checkPermission(session, "USER", "DELETE");

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw ErrorCodes.NOT_FOUND("User not found");

    checkGroupAccess(session, user.groupId);

    // Prevent deleting the last admin
    const adminCount = await prisma.user.count({
      where: { groupId: user.groupId, role: "ADMIN" },
    });

    if (user.role === "ADMIN" && adminCount === 1) {
      throw ErrorCodes.VALIDATION_ERROR(
        "Cannot delete the last admin user"
      );
    }

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

