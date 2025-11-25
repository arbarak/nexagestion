"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  reference?: string;
  createdAt: string;
  stock?: { product?: { name: string } };
}

export default function StockMovementsPage() {
  const { data: session } = useSafeSession();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [movementsRes, stockRes] = await Promise.all([
        fetch(
          `/api/inventory/movements?groupId=${(session as any)?.user?.groupId}&companyId=${(session as any)?.user?.companyId}`
        ),
        fetch(
          `/api/inventory/stock?groupId=${(session as any)?.user?.groupId}&companyId=${(session as any)?.user?.companyId}`
        ),
      ]);

      if (movementsRes.ok) {
        const data = await movementsRes.json();
        setMovements(data.data);
      }
      if (stockRes.ok) {
        const data = await stockRes.json();
        setStock(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const response = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: (session as any)?.user?.groupId,
          companyId: (session as any)?.user?.companyId,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving movement:", error);
    }
  };

  const columns = [
    {
      key: "stock" as const,
      label: "Product",
      render: (value: any) => value?.product?.name || "-",
    },
    { key: "type" as const, label: "Type" },
    { key: "quantity" as const, label: "Quantity" },
    { key: "reason" as const, label: "Reason" },
    { key: "reference" as const, label: "Reference" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Stock Movements</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title="Record Stock Movement"
            fields={[
              {
                name: "stockId",
                label: "Product",
                type: "select",
                required: true,
                options: stock.map((s) => ({
                  value: s.id,
                  label: s.product?.name || "Unknown",
                })),
              },
              {
                name: "type",
                label: "Movement Type",
                type: "select",
                required: true,
                options: [
                  { value: "IN", label: "Stock In" },
                  { value: "OUT", label: "Stock Out" },
                  { value: "ADJUSTMENT", label: "Adjustment" },
                ],
              },
              { name: "quantity", label: "Quantity", type: "number", required: true },
              { name: "reason", label: "Reason", required: true },
              { name: "reference", label: "Reference (Order #, etc)" },
            ]}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={movements}
            columns={columns}
            onAdd={() => setShowForm(true)}
            searchField="reason"
          />
        </Card>
      )}
    </div>
  );
}

