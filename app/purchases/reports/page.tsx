"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface PurchaseStats {
  totalOrders: number;
  totalInvoices: number;
  totalCost: number;
  totalTax: number;
  paidAmount: number;
  pendingAmount: number;
  averageOrderValue: number;
}

export default function PurchaseReportsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [ordersRes, invoicesRes] = await Promise.all([
        fetch(
          `/api/purchases/orders?groupId=${session?.user?.groupId}&companyId=${session?.user?.companyId}`
        ),
        fetch(
          `/api/purchases/invoices?groupId=${session?.user?.groupId}&companyId=${session?.user?.companyId}`
        ),
      ]);

      let totalOrders = 0;
      let totalInvoices = 0;
      let totalCost = 0;
      let totalTax = 0;
      let paidAmount = 0;

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        totalOrders = data.data.length;
      }

      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        totalInvoices = data.data.length;
        totalCost = data.data.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
        totalTax = data.data.reduce((sum: number, inv: any) => sum + inv.totalTax, 0);
        paidAmount = data.data.reduce((sum: number, inv: any) => sum + inv.paidAmount, 0);
      }

      const pendingAmount = totalCost - paidAmount;
      const averageOrderValue = totalOrders > 0 ? totalCost / totalOrders : 0;

      setStats({
        totalOrders,
        totalInvoices,
        totalCost,
        totalTax,
        paidAmount,
        pendingAmount,
        averageOrderValue,
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
    { label: "Total Orders", value: stats.totalOrders, icon: "📋" },
    { label: "Total Invoices", value: stats.totalInvoices, icon: "📄" },
    { label: "Total Cost", value: `$${stats.totalCost.toFixed(2)}`, icon: "💰" },
    { label: "Total Tax", value: `$${stats.totalTax.toFixed(2)}`, icon: "🏛️" },
    { label: "Paid Amount", value: `$${stats.paidAmount.toFixed(2)}`, icon: "✅" },
    { label: "Pending Amount", value: `$${stats.pendingAmount.toFixed(2)}`, icon: "⏳" },
    { label: "Average Order Value", value: `$${stats.averageOrderValue.toFixed(2)}`, icon: "📊" },
  ];

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Purchase Reports</h1>

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
        <h2 className="text-xl font-bold mb-4">Purchase Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Total Cost:</span>
            <span className="font-bold">${stats.totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Tax:</span>
            <span className="font-bold">${stats.totalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid Amount:</span>
            <span className="font-bold text-green-600">${stats.paidAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pending Amount:</span>
            <span className="font-bold text-orange-600">${stats.pendingAmount.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

