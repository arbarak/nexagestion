import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEmployeeSchema = z.object({
  groupId: z.string(),
  companyId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  department: z.string(),
  position: z.string(),
  hireDate: z.string().datetime(),
  salary: z.number().positive(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"]),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "EMPLOYEES", "READ");

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    const employees = await prisma.employee.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: employees });
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
    const data = createEmployeeSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check email uniqueness
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        companyId: data.companyId,
        email: data.email,
      },
    });

    if (existingEmployee) {
      throw ErrorCodes.CONFLICT("Employee with this email already exists");
    }

    const employee = await prisma.employee.create({
      data: {
        groupId: data.groupId,
        companyId: data.companyId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        department: data.department,
        position: data.position,
        hireDate: new Date(data.hireDate),
        salary: data.salary,
        employmentType: data.employmentType,
        status: data.status,
      },
    });

    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

