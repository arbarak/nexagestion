import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPermission, checkGroupAccess } from "@/lib/permissions";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    checkPermission(session, "REPORTS", "READ");

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const reportType = searchParams.get("type") || "balance-sheet";

    if (!companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    if (reportType === "balance-sheet") {
      const assets = await prisma.account.findMany({
        where: { companyId, accountType: "ASSET" },
      });

      const liabilities = await prisma.account.findMany({
        where: { companyId, accountType: "LIABILITY" },
      });

      const equity = await prisma.account.findMany({
        where: { companyId, accountType: "EQUITY" },
      });

      const totalAssets = assets.reduce((sum: number, a: any) => sum + a.balance, 0);
      const totalLiabilities = liabilities.reduce((sum: number, a: any) => sum + a.balance, 0);
      const totalEquity = equity.reduce((sum: number, a: any) => sum + a.balance, 0);

      return NextResponse.json({
        data: {
          reportType: "balance-sheet",
          assets: { items: assets, total: totalAssets },
          liabilities: { items: liabilities, total: totalLiabilities },
          equity: { items: equity, total: totalEquity },
          generatedAt: new Date(),
        },
      });
    }

    if (reportType === "income-statement") {
      const revenues = await prisma.account.findMany({
        where: { companyId, accountType: "REVENUE" },
      });

      const expenses = await prisma.account.findMany({
        where: { companyId, accountType: "EXPENSE" },
      });

      const totalRevenue = revenues.reduce((sum: number, a: any) => sum + a.balance, 0);
      const totalExpenses = expenses.reduce((sum: number, a: any) => sum + a.balance, 0);
      const netIncome = totalRevenue - totalExpenses;

      return NextResponse.json({
        data: {
          reportType: "income-statement",
          revenues: { items: revenues, total: totalRevenue },
          expenses: { items: expenses, total: totalExpenses },
          netIncome,
          generatedAt: new Date(),
        },
      });
    }

    throw ErrorCodes.VALIDATION_ERROR("Invalid report type");
  } catch (error) {
    return handleApiError(error);
  }
}




