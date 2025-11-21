import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAttendanceSchema = z.object({
  groupId: z.string(),
  employeeId: z.string(),
  date: z.string().datetime(),
  checkIn: z.string().time().optional(),
  checkOut: z.string().time().optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "HALF_DAY", "ON_LEAVE"]),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "EMPLOYEES", "READ");

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      throw ErrorCodes.VALIDATION_ERROR("groupId is required");
    }

    checkGroupAccess(session, groupId);

    const attendance = await prisma.attendance.findMany({
      where: {
        groupId,
        ...(employeeId && { employeeId }),
      },
      include: {
        employee: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ data: attendance });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "EMPLOYEES", "CREATE");

    const body = await request.json();
    const data = createAttendanceSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw ErrorCodes.NOT_FOUND("Employee not found");
    }

    const attendance = await prisma.attendance.create({
      data: {
        groupId: data.groupId,
        employeeId: data.employeeId,
        date: new Date(data.date),
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        status: data.status,
        notes: data.notes,
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json({ data: attendance }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

