"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PerformancePage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/performance?days=${days}`);
      if (response.ok) {
        const result = await response.json();
        setMetrics(result.data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [days]);

  const getHealthStatus = (value: number, metric: string) => {
    if (metric === "loadTime") {
      return value < 3000 ? "good" : value < 5000 ? "warning" : "poor";
    }
    if (metric === "fcp") {
      return value < 1800 ? "good" : value < 3000 ? "warning" : "poor";
    }
    if (metric === "cls") {
      return value < 0.1 ? "good" : value < 0.25 ? "warning" : "poor";
    }
    return "good";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        <p className="text-gray-600 mt-2">Track application performance metrics</p>
      </div>

      <div className="flex gap-2">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded ${
              days === d ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {d} Days
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading metrics...</p>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${getStatusColor(getHealthStatus(metrics.averages.loadTime, "loadTime"))}`}>
                  {metrics.averages.loadTime}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">First Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${getStatusColor(getHealthStatus(metrics.averages.firstContentfulPaint, "fcp"))}`}>
                  {metrics.averages.firstContentfulPaint}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Largest Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.averages.largestContentfulPaint}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cumulative Layout Shift</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${getStatusColor(getHealthStatus(metrics.averages.cumulativeLayoutShift, "cls"))}`}>
                  {metrics.averages.cumulativeLayoutShift}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.metrics.slice(0, 30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="loadTime" stroke="#8884d8" />
                  <Line type="monotone" dataKey="firstContentfulPaint" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <p>No metrics available</p>
      )}
    </div>
  );
}

