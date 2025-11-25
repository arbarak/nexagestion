"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  supplier?: { name: string };
}

export default function PurchaseOrdersPage() {
  const { data: session } = useSafeSession();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, suppliersRes] = await Promise.all([
        fetch(
          `/api/purchases/orders?groupId=${(session as any)?.user?.groupId}&companyId=${(session as any)?.user?.companyId}`
        ),
        fetch(
          `/api/referentials/suppliers?groupId=${(session as any)?.user?.groupId}`
        ),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.data);
      }
      if (suppliersRes.ok) {
        const data = await suppliersRes.json();
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingOrder
        ? `/api/purchases/orders/${editingOrder.id}`
        : "/api/purchases/orders";

      const method = editingOrder ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: (session as any)?.user?.groupId,
          companyId: (session as any)?.user?.companyId,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingOrder(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleDelete = async (order: PurchaseOrder) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await fetch(`/api/purchases/orders/${order.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const columns = [
    { key: "orderNumber" as const, label: "Order #" },
    { key: "orderDate" as const, label: "Date" },
    {
      key: "supplier" as const,
      label: "Supplier",
      render: (value: any) => value?.name || "-",
    },
    { key: "status" as const, label: "Status" },
    { key: "totalAmount" as const, label: "Total" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Purchase Orders</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingOrder ? "Edit Order" : "New Purchase Order"}
            fields={[
              { name: "orderNumber", label: "Order #", required: true },
              {
                name: "supplierId",
                label: "Supplier",
                type: "select",
                required: true,
                options: suppliers.map((s) => ({ value: s.id, label: s.name })),
              },
              { name: "orderDate", label: "Order Date", type: "text", required: true },
              { name: "dueDate", label: "Due Date", type: "text" },
              {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "DRAFT", label: "Draft" },
                  { value: "CONFIRMED", label: "Confirmed" },
                  { value: "RECEIVED", label: "Received" },
                  { value: "INVOICED", label: "Invoiced" },
                  { value: "CANCELLED", label: "Cancelled" },
                ],
              },
              { name: "notes", label: "Notes" },
            ]}
            initialData={editingOrder || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingOrder(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={orders}
            columns={columns}
            onEdit={(order) => {
              setEditingOrder(order);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="orderNumber"
          />
        </Card>
      )}
    </div>
  );
}

