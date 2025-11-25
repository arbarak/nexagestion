"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { InvoiceDialog } from "@/components/sales/invoice-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  totalAmount: number;
  paidAmount: number;
  client?: { name: string };
  clientId: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}

export default function SalesInvoicesPage() {
  const { data: session } = useSafeSession();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, clientsRes] = await Promise.all([
        fetch(
          `/api/sales/invoices?groupId=${(session as any)?.user?.groupId}&companyId=${(session as any)?.user?.companyId}`
        ),
        fetch(
          `/api/referentials/clients?groupId=${(session as any)?.user?.groupId}`
        ),
      ]);

      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setInvoices(data.data);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingInvoice
        ? `/api/sales/invoices/${editingInvoice.id}`
        : "/api/sales/invoices";

      const method = editingInvoice ? "PATCH" : "POST";

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
        setEditingInvoice(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handleDelete = async (invoice: SalesInvoice) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        const response = await fetch(`/api/sales/invoices/${invoice.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const columns = [
    { key: "invoiceNumber" as const, label: "Invoice #" },
    { key: "invoiceDate" as const, label: "Date" },
    {
      key: "client" as const,
      label: "Client",
      render: (value: any) => value?.name || "-",
    },
    { key: "status" as const, label: "Status" },
    { key: "totalAmount" as const, label: "Total" },
    { key: "paidAmount" as const, label: "Paid" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Invoices</h1>
        <Button onClick={() => {
          setEditingInvoice(null);
          setShowForm(true);
        }}>
          New Invoice
        </Button>
      </div>

      <Card className="p-6">
        <DataTable
          data={invoices}
          columns={columns}
          onEdit={(invoice) => {
            setEditingInvoice(invoice);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          onAdd={() => {
            setEditingInvoice(null);
            setShowForm(true);
          }}
          searchField="invoiceNumber"
        />
      </Card>

      <InvoiceDialog
        open={showForm}
        onOpenChange={setShowForm}
        initialData={editingInvoice || undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

