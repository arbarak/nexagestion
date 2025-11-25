"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface InventoryStats {
  totalProducts: number;
  totalQuantity: number;
  lowStockItems: number;
  totalMovements: number;
  inMovements: number;
  outMovements: number;
  adjustments: number;
}

export default function InventoryReportsPage() {
  const { data: session } = useSafeSession();
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [stockRes, movementsRes] = await Promise.all([
        fetch(
          `/api/inventory/stock?groupId=${(session as any)?.user?.groupId}&companyId=${(session as any)?.user?.companyId}`
        ),
        fetch(
          `/api/inventory/movements?groupId=${(session as any)?.user?.groupId}&companyId=${(session as any)?.user?.companyId}`
        ),
      ]);

      let totalProducts = 0;
      let totalQuantity = 0;
      let lowStockItems = 0;

      if (stockRes.ok) {
        const data = await stockRes.json();
        totalProducts = data.data.length;
        totalQuantity = data.data.reduce((sum: number, s: any) => sum + s.quantity, 0);
        lowStockItems = data.data.filter((s: any) => s.quantity < 10).length;
      }

      let totalMovements = 0;
      let inMovements = 0;
      let outMovements = 0;
      let adjustments = 0;

      if (movementsRes.ok) {
        const data = await movementsRes.json();
        totalMovements = data.data.length;
        inMovements = data.data.filter((m: any) => m.type === "IN").length;
        outMovements = data.data.filter((m: any) => m.type === "OUT").length;
        adjustments = data.data.filter((m: any) => m.type === "ADJUSTMENT").length;
      }

      setStats({
        totalProducts,
        totalQuantity,
        lowStockItems,
        totalMovements,
        inMovements,
        outMovements,
        adjustments,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!stats) {
    return <div className="p-8">No data available</div>;
  }

  const metrics = [
    { label: "Total Products", value: stats.totalProducts, icon: "📦" },
    { label: "Total Quantity", value: stats.totalQuantity, icon: "📊" },
    { label: "Low Stock Items", value: stats.lowStockItems, icon: "⚠️" },
    { label: "Total Movements", value: stats.totalMovements, icon: "🔄" },
    { label: "Stock In", value: stats.inMovements, icon: "📥" },
    { label: "Stock Out", value: stats.outMovements, icon: "📤" },
    { label: "Adjustments", value: stats.adjustments, icon: "🔧" },
  ];

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Inventory Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-6">
            <div className="text-3xl mb-2">{metric.icon}</div>
            <p className="text-gray-600 text-sm">{metric.label}</p>
            <p className="text-2xl font-bold">{metric.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Inventory Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Total Products:</span>
            <span className="font-bold">{stats.totalProducts}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Quantity:</span>
            <span className="font-bold">{stats.totalQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span>Low Stock Items:</span>
            <span className="font-bold text-orange-600">{stats.lowStockItems}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Movements:</span>
            <span className="font-bold">{stats.totalMovements}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

