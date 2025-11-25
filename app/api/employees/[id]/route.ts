import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateEmployeeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "EMPLOYEE", "READ");

    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { checkIn: "desc" },
          take: 30,
        },
        company: true,
      },
    });

    if (!employee) throw ErrorCodes.NOT_FOUND("Employee not found");
    checkGroupAccess(session, employee.company.groupId);

    return NextResponse.json({ data: employee });
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
    checkPermission(session, "EMPLOYEE", "UPDATE");

    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!employee) throw ErrorCodes.NOT_FOUND("Employee not found");
    checkGroupAccess(session, employee.company.groupId);

    const body = await request.json();
    const data = updateEmployeeSchema.parse(body);

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        position: data.position,
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
    checkPermission(session, "EMPLOYEE", "DELETE");

    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!employee) throw ErrorCodes.NOT_FOUND("Employee not found");
    checkGroupAccess(session, employee.company.groupId);



    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

