import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const exportSchema = z.object({
  module: z.enum(["sales", "purchases", "inventory", "employees", "financial"]),
  format: z.enum(["csv", "json", "xlsx"]),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(",")
    ),
  ];

  return csv.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "EXPORT", "CREATE");

    const body = await request.json();
    const { module, format, dateFrom, dateTo } = exportSchema.parse(body);

    checkGroupAccess(session, session.user.groupId);

    let data: any[] = [];

    // Fetch data based on module
    if (module === "sales") {
      data = await prisma.salesOrder.findMany({
        where: { companyId: session.user.companyId },
        include: { lineItems: true, client: true },
      });
    } else if (module === "purchases") {
      data = await prisma.purchaseOrder.findMany({
        where: { companyId: session.user.companyId },
        include: { lineItems: true, supplier: true },
      });
    } else if (module === "inventory") {
      data = await prisma.stock.findMany({
        where: { companyId: session.user.companyId },
        include: { product: true, warehouse: true },
      });
    } else if (module === "employees") {
      data = await prisma.employee.findMany({
        where: { companyId: session.user.companyId },
      });
    } else if (module === "financial") {
      data = await prisma.account.findMany({
        where: { companyId: session.user.companyId },
      });
    }

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === "csv") {
      content = convertToCSV(data);
      contentType = "text/csv";
      filename = `${module}-export-${Date.now()}.csv`;
    } else if (format === "json") {
      content = JSON.stringify(data, null, 2);
      contentType = "application/json";
      filename = `${module}-export-${Date.now()}.json`;
    } else {
      // XLSX format - simplified version
      content = JSON.stringify(data);
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      filename = `${module}-export-${Date.now()}.xlsx`;
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

