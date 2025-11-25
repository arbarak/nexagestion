"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface ReportData {
  totalVessels: number;
  activeVessels: number;
  totalVoyages: number;
  inTransitVoyages: number;
  totalCargo: number;
  deliveredCargo: number;
  totalCargoWeight: number;
  totalCargoVolume: number;
}

export default function MaritimeReportsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ReportData>({
    totalVessels: 0,
    activeVessels: 0,
    totalVoyages: 0,
    inTransitVoyages: 0,
    totalCargo: 0,
    deliveredCargo: 0,
    totalCargoWeight: 0,
    totalCargoVolume: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vesselsRes, voyagesRes, cargoRes] = await Promise.all([
        fetch(`/api/maritime/vessels?groupId=${(session as any)?.user?.groupId}`),
        fetch(`/api/maritime/voyages?groupId=${(session as any)?.user?.groupId}`),
        fetch(`/api/maritime/cargo?groupId=${(session as any)?.user?.groupId}`),
      ]);

      let vessels = [];
      let voyages = [];
      let cargo = [];

      if (vesselsRes.ok) {
        const result = await vesselsRes.json();
        vessels = result.data;
      }

      if (voyagesRes.ok) {
        const result = await voyagesRes.json();
        voyages = result.data;
      }

      if (cargoRes.ok) {
        const result = await cargoRes.json();
        cargo = result.data;
      }

      const activeVessels = vessels.filter((v: any) => v.status === "ACTIVE").length;
      const inTransitVoyages = voyages.filter((v: any) => v.status === "IN_TRANSIT").length;
      const deliveredCargo = cargo.filter((c: any) => c.status === "DELIVERED").length;
      const totalCargoWeight = cargo.reduce((sum: number, c: any) => sum + (c.weight || 0), 0);
      const totalCargoVolume = cargo.reduce((sum: number, c: any) => sum + (c.volume || 0), 0);

      setData({
        totalVessels: vessels.length,
        activeVessels,
        totalVoyages: voyages.length,
        inTransitVoyages,
        totalCargo: cargo.length,
        deliveredCargo,
        totalCargoWeight,
        totalCargoVolume,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Maritime Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600">Total Vessels</div>
          <div className="text-3xl font-bold mt-2">{data.totalVessels}</div>
          <div className="text-xs text-green-600 mt-2">{data.activeVessels} active</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600">Total Voyages</div>
          <div className="text-3xl font-bold mt-2">{data.totalVoyages}</div>
          <div className="text-xs text-blue-600 mt-2">{data.inTransitVoyages} in transit</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600">Total Cargo</div>
          <div className="text-3xl font-bold mt-2">{data.totalCargo}</div>
          <div className="text-xs text-green-600 mt-2">{data.deliveredCargo} delivered</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600">Cargo Weight</div>
          <div className="text-3xl font-bold mt-2">{data.totalCargoWeight.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-2">tons</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Fleet Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Cargo Volume</div>
            <div className="text-2xl font-bold mt-1">{data.totalCargoVolume.toLocaleString()} m³</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Average Cargo per Voyage</div>
            <div className="text-2xl font-bold mt-1">
              {data.totalVoyages > 0 ? (data.totalCargo / data.totalVoyages).toFixed(1) : 0}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

