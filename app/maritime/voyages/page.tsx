"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Voyage {
  id: string;
  voyageNumber: string;
  vesselId: string;
  departurePort: string;
  arrivalPort: string;
  status: string;
}

interface Vessel {
  id: string;
  vesselName: string;
}

export default function VoyagesPage() {
  const { data: session } = useSession();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVoyage, setEditingVoyage] = useState<Voyage | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [voyagesRes, vesselsRes] = await Promise.all([
        fetch(`/api/maritime/voyages?groupId=${session?.user?.groupId}`),
        fetch(`/api/maritime/vessels?groupId=${session?.user?.groupId}`),
      ]);

      if (voyagesRes.ok) {
        const data = await voyagesRes.json();
        setVoyages(data.data);
      }

      if (vesselsRes.ok) {
        const data = await vesselsRes.json();
        setVessels(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingVoyage
        ? `/api/maritime/voyages/${editingVoyage.id}`
        : "/api/maritime/voyages";

      const method = editingVoyage ? "PATCH" : "POST";

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
        setEditingVoyage(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving voyage:", error);
    }
  };

  const handleDelete = async (voyage: Voyage) => {
    if (confirm("Are you sure you want to delete this voyage?")) {
      try {
        const response = await fetch(`/api/maritime/voyages/${voyage.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting voyage:", error);
      }
    }
  };

  const columns = [
    { key: "voyageNumber" as const, label: "Voyage #" },
    { key: "departurePort" as const, label: "Departure" },
    { key: "arrivalPort" as const, label: "Arrival" },
    { key: "status" as const, label: "Status" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Voyage Management</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingVoyage ? "Edit Voyage" : "New Voyage"}
            fields={[
              { name: "voyageNumber", label: "Voyage Number", required: true },
              {
                name: "vesselId",
                label: "Vessel",
                type: "select",
                required: true,
                options: vessels.map((v) => ({ value: v.id, label: v.vesselName })),
              },
              { name: "departurePort", label: "Departure Port", required: true },
              { name: "arrivalPort", label: "Arrival Port", required: true },
              { name: "departureDate", label: "Departure Date", type: "datetime-local", required: true },
              { name: "estimatedArrivalDate", label: "Est. Arrival", type: "datetime-local", required: true },
              { name: "actualArrivalDate", label: "Actual Arrival", type: "datetime-local" },
              {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "PLANNED", label: "Planned" },
                  { value: "IN_TRANSIT", label: "In Transit" },
                  { value: "ARRIVED", label: "Arrived" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "CANCELLED", label: "Cancelled" },
                ],
              },
              { name: "cargoCapacity", label: "Cargo Capacity (tons)", type: "number", required: true },
              { name: "cargoLoaded", label: "Cargo Loaded (tons)", type: "number", required: true },
            ]}
            initialData={editingVoyage || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingVoyage(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={voyages}
            columns={columns}
            onEdit={(voyage) => {
              setEditingVoyage(voyage);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="voyageNumber"
          />
        </Card>
      )}
    </div>
  );
}

