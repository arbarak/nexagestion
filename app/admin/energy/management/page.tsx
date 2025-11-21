'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Droplet, Wind, Leaf } from 'lucide-react';

interface EnergyMetrics {
  totalConsumption: number;
  electricityUsage: number;
  gasUsage: number;
  waterUsage: number;
  renewableUsage: number;
  totalCost: number;
  averageCost: number;
  targetsAchieved: number;
  carbonFootprint: number;
}

export default function EnergyManagementPage() {
  const [metrics, setMetrics] = useState<EnergyMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnergyMetrics();
  }, []);

  const fetchEnergyMetrics = async () => {
    try {
      const response = await fetch('/api/energy/management?action=metrics');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading energy information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Energy Management
          </h1>
          <p className="text-gray-600">Monitor and manage energy consumption</p>
        </div>
        <Button>Record Consumption</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Energy Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{metrics.totalConsumption.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Electricity</p>
                <p className="text-2xl font-bold">{metrics.electricityUsage.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Gas</p>
                <p className="text-2xl font-bold">{metrics.gasUsage.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Water</p>
                <p className="text-2xl font-bold">{metrics.waterUsage.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Renewable</p>
                <p className="text-2xl font-bold">{metrics.renewableUsage.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">${(metrics.totalCost / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Cost</p>
                <p className="text-2xl font-bold">${(metrics.averageCost / 100).toFixed(0)}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Targets</p>
                <p className="text-2xl font-bold">{metrics.targetsAchieved}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Carbon</p>
                <p className="text-2xl font-bold">{metrics.carbonFootprint.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Energy Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-semibold">Consumption Tracking</h3>
                <p className="text-sm text-gray-600">Record energy consumption</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Energy Targets</h3>
                <p className="text-sm text-gray-600">Set and track energy targets</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wind className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Renewable Energy</h3>
                <p className="text-sm text-gray-600">Track renewable energy usage</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Droplet className="h-5 w-5 text-cyan-500" />
              <div>
                <h3 className="font-semibold">Water Management</h3>
                <p className="text-sm text-gray-600">Monitor water consumption</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

