"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const { data: session } = useSafeSession();
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const [salesRes, inventoryRes] = await Promise.all([
        fetch(`/api/reports/sales?companyId=${(session as any)?.user?.companyId}`),
        fetch(`/api/reports/inventory?companyId=${(session as any)?.user?.companyId}`),
      ]);

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSalesReport(salesData.data);
      }

      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventoryReport(inventoryData.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((session as any)?.user?.companyId) {
      fetchReports();
    }
  }, [session]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          View comprehensive business analytics and reports
        </p>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>
          {/* Sales Analytics */}
          {salesReport && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Sales Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${(salesReport as any).totalSales.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {(salesReport as any).totalOrders}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Average Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${(salesReport as any).averageOrderValue.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pending Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {(salesReport as any).salesByStatus.DRAFT}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Inventory Analytics */}
          {inventoryReport && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Inventory Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {(inventoryReport as any).totalItems}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Quantity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {(inventoryReport as any).totalQuantity}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Inventory Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${(inventoryReport as any).totalValue.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-sm">Low Stock Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {(inventoryReport as any).lowStockItems}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/financial/reports">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>Financial Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      View balance sheet and income statement
                    </p>
                    <Button variant="outline" className="mt-4 w-full">
                      View →
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/financial/audit-logs">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Track all system activities
                    </p>
                    <Button variant="outline" className="mt-4 w-full">
                      View →
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/notifications">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      View system notifications
                    </p>
                    <Button variant="outline" className="mt-4 w-full">
                      View →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

