import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const importSchema = z.object({
  module: z.enum(["sales", "purchases", "inventory", "employees", "financial"]),
  data: z.array(z.record(z.any())),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "EMPLOYEE", "CREATE");

    const body = await request.json();
    const { module, data } = importSchema.parse(body);

    if (!session.companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    let importedCount = 0;
    const errors: string[] = [];

    // Process imports based on module
    if (module === "employees") {
      for (const row of data) {
        try {
          await prisma.employee.create({
            data: {
              groupId: session.userId,
              companyId: session.companyId,
              firstName: row.firstName || "",
              lastName: row.lastName || "",
              email: row.email || "",
              phone: row.phone || "",
              position: row.position || "",
              department: row.department || "",
              hireDate: row.hireDate ? new Date(row.hireDate) : new Date(),
              status: "ACTIVE",
            },
          });
          importedCount++;
        } catch (error) {
          errors.push(`Row ${importedCount + 1}: ${String(error)}`);
        }
      }
    } else if (module === "financial") {
      for (const row of data) {
        try {
          await prisma.account.create({
            data: {
              groupId: session.userId,
              companyId: session.companyId,
              accountCode: row.accountCode || "",
              accountName: row.accountName || "",
              accountType: row.accountType || "ASSET",
              balance: parseFloat(row.balance) || 0,
              currency: row.currency || "USD",
              status: "ACTIVE",
            },
          });
          importedCount++;
        } catch (error) {
          errors.push(`Row ${importedCount + 1}: ${String(error)}`);
        }
      }
    }

    return NextResponse.json({
      data: {
        importedCount,
        totalRows: data.length,
        errors,
        success: errors.length === 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

