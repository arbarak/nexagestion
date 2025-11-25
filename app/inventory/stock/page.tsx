"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Stock {
  id: string;
  quantity: number;
  warehouseLocation?: string;
  product?: { name: string; code: string };
}

export default function StockPage() {
  const { data: session } = useSession();
  const [stock, setStock] = useState<Stock[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockRes, productsRes] = await Promise.all([
        fetch(
          `/api/inventory/stock?groupId=${(session as any)?.user?.groupId}&companyId=${(session as any)?.user?.companyId}`
        ),
        fetch(
          `/api/referentials/products?groupId=${(session as any)?.user?.groupId}`
        ),
      ]);

      if (stockRes.ok) {
        const data = await stockRes.json();
        setStock(data.data);
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingStock
        ? `/api/inventory/stock/${editingStock.id}`
        : "/api/inventory/stock";

      const method = editingStock ? "PATCH" : "POST";

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
        setEditingStock(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving stock:", error);
    }
  };

  const handleDelete = async (item: Stock) => {
    if (confirm("Are you sure you want to delete this stock?")) {
      try {
        const response = await fetch(`/api/inventory/stock/${item.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting stock:", error);
      }
    }
  };

  const columns = [
    {
      key: "product" as const,
      label: "Product",
      render: (value: any) => value?.name || "-",
    },
    { key: "quantity" as const, label: "Quantity" },
    { key: "warehouseLocation" as const, label: "Location" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Stock Management</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingStock ? "Edit Stock" : "New Stock"}
            fields={[
              {
                name: "productId",
                label: "Product",
                type: "select",
                required: true,
                options: products.map((p) => ({ value: p.id, label: p.name })),
              },
              { name: "quantity", label: "Quantity", type: "number", required: true },
              { name: "warehouseLocation", label: "Warehouse Location" },
            ]}
            initialData={editingStock || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingStock(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={stock}
            columns={columns}
            onEdit={(item) => {
              setEditingStock(item);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="product"
          />
        </Card>
      )}
    </div>
  );
}

