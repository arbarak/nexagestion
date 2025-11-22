import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { ErrorCodes, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const prisma = new PrismaClient();

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  ice: z.string().optional(),
  if: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "CLIENT", "READ");

    const client = await prisma.client.findUnique({
      where: { id: id },
    });

    if (!client) throw ErrorCodes.NOT_FOUND("Client not found");

    checkGroupAccess(session, client.groupId);

    return NextResponse.json({ data: client });
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

    checkPermission(session, "CLIENT", "UPDATE");

    const client = await prisma.client.findUnique({
      where: { id: id },
    });

    if (!client) throw ErrorCodes.NOT_FOUND("Client not found");

    checkGroupAccess(session, client.groupId);

    const body = await request.json();
    const data = updateClientSchema.parse(body);

    const updated = await prisma.client.update({
      where: { id: id },
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
    const { id } = await params;
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    checkPermission(session, "CLIENT", "DELETE");

    const client = await prisma.client.findUnique({
      where: { id: id },
    });

    if (!client) throw ErrorCodes.NOT_FOUND("Client not found");

    checkGroupAccess(session, client.groupId);

    await prisma.client.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

