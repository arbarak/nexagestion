import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) throw ErrorCodes.NOT_FOUND("Notification not found");

    if (notification.userId !== session.user.id) {
      throw ErrorCodes.FORBIDDEN("Cannot update other user's notification");
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
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

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) throw ErrorCodes.NOT_FOUND("Notification not found");

    if (notification.userId !== session.user.id) {
      throw ErrorCodes.FORBIDDEN("Cannot delete other user's notification");
    }

    await prisma.notification.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

