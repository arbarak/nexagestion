"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  client?: { name: string };
}

export default function SalesInvoicesPage() {
  const { data: session } = useSession();
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
          `/api/sales/invoices?groupId=${session?.user?.groupId}&companyId=${session?.user?.companyId}`
        ),
        fetch(
          `/api/referentials/clients?groupId=${session?.user?.groupId}`
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
          groupId: session?.user?.groupId,
          companyId: session?.user?.companyId,
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
      <h1 className="text-3xl font-bold">Sales Invoices</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingInvoice ? "Edit Invoice" : "New Sales Invoice"}
            fields={[
              { name: "invoiceNumber", label: "Invoice #", required: true },
              {
                name: "clientId",
                label: "Client",
                type: "select",
                required: true,
                options: clients.map((c) => ({ value: c.id, label: c.name })),
              },
              { name: "invoiceDate", label: "Invoice Date", type: "text", required: true },
              { name: "dueDate", label: "Due Date", type: "text", required: true },
              {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "DRAFT", label: "Draft" },
                  { value: "ISSUED", label: "Issued" },
                  { value: "PAID", label: "Paid" },
                  { value: "OVERDUE", label: "Overdue" },
                  { value: "CANCELLED", label: "Cancelled" },
                ],
              },
              { name: "paidAmount", label: "Paid Amount", type: "number" },
              { name: "notes", label: "Notes" },
            ]}
            initialData={editingInvoice || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingInvoice(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={invoices}
            columns={columns}
            onEdit={(invoice) => {
              setEditingInvoice(invoice);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="invoiceNumber"
          />
        </Card>
      )}
    </div>
  );
}

