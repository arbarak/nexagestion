"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { SaleDialog } from "@/components/sales/sale-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface SalesOrder {
    id: string;
    orderNumber: string;
    orderDate: string;
    status: "DRAFT" | "QUOTE" | "ORDER" | "DELIVERY" | "INVOICED" | "PAID" | "CANCELLED";
    totalAmount: number;
    client?: { name: string };
    clientId: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
}

export default function DeliveryNotesPage() {
    const { data: session } = useSafeSession();
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch orders with status DELIVERY
            const response = await fetch(
                `/api/sales/orders?groupId=${(session as any)?.user?.groupId}&companyId=${(session as any)?.user?.companyId}&status=DELIVERY`
            );

            if (response.ok) {
                const data = await response.json();
                setOrders(data.data);
            }
        } catch (error) {
            console.error("Error fetching delivery notes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: Record<string, any>) => {
        try {
            const url = editingOrder
                ? `/api/sales/orders/${editingOrder.id}`
                : "/api/sales/orders";

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
            console.error("Error saving delivery note:", error);
        }
    };

    const handleDelete = async (order: SalesOrder) => {
        if (confirm("Are you sure you want to delete this delivery note?")) {
            try {
                const response = await fetch(`/api/sales/orders/${order.id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    fetchData();
                }
            } catch (error) {
                console.error("Error deleting delivery note:", error);
            }
        }
    };

    const columns = [
        { key: "orderNumber" as const, label: "Note #" },
        { key: "orderDate" as const, label: "Date" },
        {
            key: "client" as const,
            label: "Client",
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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Delivery Notes</h1>
                <Button onClick={() => {
                    setEditingOrder(null);
                    setShowForm(true);
                }}>
                    New Delivery Note
                </Button>
            </div>

            <Card className="p-6">
                <DataTable
                    data={orders}
                    columns={columns}
                    onEdit={(order) => {
                        setEditingOrder(order);
                        setShowForm(true);
                    }}
                    onDelete={handleDelete}
                    onAdd={() => {
                        setEditingOrder(null);
                        setShowForm(true);
                    }}
                    searchField="orderNumber"
                />
            </Card>

            <SaleDialog
                open={showForm}
                onOpenChange={setShowForm}
                initialData={editingOrder || undefined}
                onSubmit={handleSubmit}
                allowedStatuses={["DRAFT", "DELIVERY", "CANCELLED"]}
            />
        </div>
    );
}
