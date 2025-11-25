"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ProductDialog } from "@/components/referentials/product-dialog";
import { ProductQRDialog } from "@/components/referentials/product-qr-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { useSession } from "next-auth/react";

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  cost: number;
  category?: { name: string };
  brand?: { name: string };
}

export default function ProductsPage() {
  const { data: session } = useSafeSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showQR, setShowQR] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/referentials/products?groupId=${(session as any)?.user?.groupId}`);

      if (response.ok) {
        const data = await response.json();
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
      const url = editingProduct
        ? `/api/referentials/products/${editingProduct.id}`
        : "/api/referentials/products";

      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: (session as any)?.user?.groupId,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingProduct(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          `/api/referentials/products/${product.id}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const columns = [
    { key: "code" as const, label: "Code" },
    { key: "name" as const, label: "Name" },
    {
      key: "category" as const,
      label: "Category",
      render: (value: any) => value?.name || "-",
    },
    {
      key: "brand" as const,
      label: "Brand",
      render: (value: any) => value?.name || "-",
    },
    { key: "price" as const, label: "Price" },
    { key: "cost" as const, label: "Cost" },
    {
      key: "qr" as const,
      label: "QR",
      render: (product: Product) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProduct(product);
            setShowQR(true);
          }}
        >
          <QrCode className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Button onClick={() => {
          setEditingProduct(null);
          setShowForm(true);
        }}>
          Add New Product
        </Button>
      </div>

      <Card className="p-6">
        <DataTable
          data={products}
          columns={columns}
          onEdit={(product) => {
            setEditingProduct(product);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          onAdd={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          searchField="name"
        />
      </Card>

      <ProductDialog
        open={showForm}
        onOpenChange={setShowForm}
        initialData={editingProduct || undefined}
        onSubmit={handleSubmit}
      />

      <ProductQRDialog
        open={showQR}
        onOpenChange={setShowQR}
        product={selectedProduct}
      />
    </div>
  );
}
