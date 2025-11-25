import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEmployeeSchema = z.object({
  companyId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  position: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "EMPLOYEE", "READ");

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
    checkPermission(session, "EMPLOYEE", "CREATE");

    const body = await request.json();
    const data = createEmployeeSchema.parse(body);

    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw ErrorCodes.NOT_FOUND("Company not found");
    }

    checkGroupAccess(session, company.groupId);

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
        companyId: data.companyId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        position: data.position,
      },
    });

    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

