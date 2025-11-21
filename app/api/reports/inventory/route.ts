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

    if (!companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    checkGroupAccess(session, session.user.groupId);

    // Get inventory data
    const stocks = await prisma.stock.findMany({
      where: { companyId },
    });

    // Calculate metrics
    const totalItems = stocks.length;
    const totalQuantity = stocks.reduce((sum: number, s: any) => sum + s.quantity, 0);
    const totalValue = stocks.reduce((sum: number, s: any) => sum + (s.quantity * (s.unitPrice || 0)), 0);

    // Low stock items (quantity < 10)
    const lowStockItems = stocks.filter((s: any) => s.quantity < 10);

    // Out of stock items
    const outOfStockItems = stocks.filter((s: any) => s.quantity === 0);

    // Stock movements summary
    const movements = await prisma.stockMovement.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const movementsByType = {
      IN: movements.filter((m: any) => m.type === "IN").length,
      OUT: movements.filter((m: any) => m.type === "OUT").length,
      ADJUSTMENT: movements.filter((m: any) => m.type === "ADJUSTMENT").length,
    };

    return NextResponse.json({
      data: {
        totalItems,
        totalQuantity,
        totalValue,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        movementsByType,
        recentMovements: movements.slice(0, 10),
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}




