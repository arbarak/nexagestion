"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Cargo {
  id: string;
  cargoNumber: string;
  description: string;
  cargoType: string;
  status: string;
  weight: number;
}

interface Voyage {
  id: string;
  voyageNumber: string;
}

export default function CargoPage() {
  const { data: session } = useSession();
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cargoRes, voyagesRes] = await Promise.all([
        fetch(`/api/maritime/cargo?groupId=${session?.user?.groupId}`),
        fetch(`/api/maritime/voyages?groupId=${session?.user?.groupId}`),
      ]);

      if (cargoRes.ok) {
        const data = await cargoRes.json();
        setCargo(data.data);
      }

      if (voyagesRes.ok) {
        const data = await voyagesRes.json();
        setVoyages(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingCargo
        ? `/api/maritime/cargo/${editingCargo.id}`
        : "/api/maritime/cargo";

      const method = editingCargo ? "PATCH" : "POST";

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
        setEditingCargo(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving cargo:", error);
    }
  };

  const handleDelete = async (cargoItem: Cargo) => {
    if (confirm("Are you sure you want to delete this cargo?")) {
      try {
        const response = await fetch(`/api/maritime/cargo/${cargoItem.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting cargo:", error);
      }
    }
  };

  const columns = [
    { key: "cargoNumber" as const, label: "Cargo #" },
    { key: "description" as const, label: "Description" },
    { key: "cargoType" as const, label: "Type" },
    { key: "status" as const, label: "Status" },
    { key: "weight" as const, label: "Weight (tons)" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Cargo Tracking</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingCargo ? "Edit Cargo" : "New Cargo"}
            fields={[
              { name: "cargoNumber", label: "Cargo Number", required: true },
              {
                name: "voyageId",
                label: "Voyage",
                type: "select",
                required: true,
                options: voyages.map((v) => ({ value: v.id, label: v.voyageNumber })),
              },
              { name: "description", label: "Description", required: true },
              { name: "weight", label: "Weight (tons)", type: "number", required: true },
              { name: "volume", label: "Volume (m³)", type: "number", required: true },
              {
                name: "cargoType",
                label: "Cargo Type",
                type: "select",
                required: true,
                options: [
                  { value: "CONTAINER", label: "Container" },
                  { value: "BREAKBULK", label: "Breakbulk" },
                  { value: "LIQUID", label: "Liquid" },
                  { value: "VEHICLE", label: "Vehicle" },
                  { value: "PROJECT", label: "Project" },
                ],
              },
              { name: "shipper", label: "Shipper", required: true },
              { name: "consignee", label: "Consignee", required: true },
              {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "LOADED", label: "Loaded" },
                  { value: "IN_TRANSIT", label: "In Transit" },
                  { value: "ARRIVED", label: "Arrived" },
                  { value: "DELIVERED", label: "Delivered" },
                  { value: "DAMAGED", label: "Damaged" },
                ],
              },
            ]}
            initialData={editingCargo || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingCargo(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={cargo}
            columns={columns}
            onEdit={(cargoItem) => {
              setEditingCargo(cargoItem);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="cargoNumber"
          />
        </Card>
      )}
    </div>
  );
}

