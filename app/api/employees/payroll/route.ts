import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPayrollSchema = z.object({
  groupId: z.string(),
  employeeId: z.string(),
  month: z.string(),
  baseSalary: z.number().positive(),
  bonus: z.number().min(0),
  deductions: z.number().min(0),
  netSalary: z.number().positive(),
  status: z.enum(["DRAFT", "APPROVED", "PAID", "CANCELLED"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "EMPLOYEE", "READ");

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      throw ErrorCodes.VALIDATION_ERROR("groupId is required");
    }

    checkGroupAccess(session, groupId);

    const payroll = await prisma.payroll.findMany({
      where: {
        groupId,
        ...(employeeId && { employeeId }),
      },
      include: {
        employee: true,
      },
      orderBy: { month: "desc" },
    });

    return NextResponse.json({ data: payroll });
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
    const data = createPayrollSchema.parse(body);

    checkGroupAccess(session, data.groupId);

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw ErrorCodes.NOT_FOUND("Employee not found");
    }

    // Check if payroll already exists for this month
    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        employeeId: data.employeeId,
        month: data.month,
      },
    });

    if (existingPayroll) {
      throw ErrorCodes.CONFLICT("Payroll already exists for this month");
    }

    const payroll = await prisma.payroll.create({
      data: {
        groupId: data.groupId,
        employeeId: data.employeeId,
        month: data.month,
        baseSalary: data.baseSalary,
        bonus: data.bonus,
        deductions: data.deductions,
        netSalary: data.netSalary,
        status: data.status,
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json({ data: payroll }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

