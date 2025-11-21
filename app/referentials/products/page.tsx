"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
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
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch(`/api/referentials/products?groupId=${session?.user?.groupId}`),
        fetch(`/api/referentials/categories?groupId=${session?.user?.groupId}`),
        fetch(`/api/referentials/brands?groupId=${session?.user?.groupId}`),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.data);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.data);
      }
      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setBrands(data.data);
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
          groupId: session?.user?.groupId,
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
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Products Management</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingProduct ? "Edit Product" : "Add New Product"}
            fields={[
              { name: "code", label: "Code", required: true },
              { name: "name", label: "Name", required: true },
              { name: "description", label: "Description" },
              {
                name: "categoryId",
                label: "Category",
                type: "select",
                options: categories.map((c) => ({ value: c.id, label: c.name })),
              },
              {
                name: "brandId",
                label: "Brand",
                type: "select",
                options: brands.map((b) => ({ value: b.id, label: b.name })),
              },
              { name: "price", label: "Price", type: "number", required: true },
              { name: "cost", label: "Cost", type: "number", required: true },
            ]}
            initialData={editingProduct || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={products}
            columns={columns}
            onEdit={(product) => {
              setEditingProduct(product);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="name"
          />
        </Card>
      )}
    </div>
  );
}

