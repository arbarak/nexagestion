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

    // Get sales data
    const sales = await prisma.sale.findMany({
      where: { companyId },
      include: { items: true },
    });

    // Calculate metrics
    const totalSales = sales.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);
    const totalOrders = sales.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get sales by status
    const salesByStatus = {
      DRAFT: sales.filter((s: any) => s.status === "DRAFT").length,
      CONFIRMED: sales.filter((s: any) => s.status === "CONFIRMED").length,
      SHIPPED: sales.filter((s: any) => s.status === "SHIPPED").length,
      DELIVERED: sales.filter((s: any) => s.status === "DELIVERED").length,
      CANCELLED: sales.filter((s: any) => s.status === "CANCELLED").length,
    };

    // Get top products
    const productSales: Record<string, number> = {};
    sales.forEach((sale) => {
      sale.items.forEach((item: any) => {
        productSales[item.productId] =
          (productSales[item.productId] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([productId, quantity]) => ({ productId, quantity }));

    return NextResponse.json({
      data: {
        totalSales,
        totalOrders,
        averageOrderValue,
        salesByStatus,
        topProducts,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}




