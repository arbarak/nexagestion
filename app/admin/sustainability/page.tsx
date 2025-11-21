'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Trash2, TreePine, TrendingUp } from 'lucide-react';

interface SustainabilityMetrics {
  totalWaste: number;
  recycledWaste: number;
  wasteReductionRate: number;
  greenInitiativesCompleted: number;
  totalCarbonOffset: number;
  estimatedCarbonReduction: number;
  sustainabilityScore: number;
}

export default function SustainabilityPage() {
  const [metrics, setMetrics] = useState<SustainabilityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSustainabilityMetrics();
  }, []);

  const fetchSustainabilityMetrics = async () => {
    try {
      const response = await fetch('/api/sustainability?action=metrics');
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
    return <div className="p-8">Loading sustainability information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Leaf className="h-8 w-8" />
            Sustainability
          </h1>
          <p className="text-gray-600">Track environmental impact and initiatives</p>
        </div>
        <Button>New Initiative</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Sustainability Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Waste</p>
                <p className="text-2xl font-bold">{metrics.totalWaste.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Recycled</p>
                <p className="text-2xl font-bold">{metrics.recycledWaste.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600">Reduction %</p>
                <p className="text-2xl font-bold">{metrics.wasteReductionRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Initiatives</p>
                <p className="text-2xl font-bold">{metrics.greenInitiativesCompleted}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Carbon Offset</p>
                <p className="text-2xl font-bold">{metrics.totalCarbonOffset.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Reduction</p>
                <p className="text-2xl font-bold">{metrics.estimatedCarbonReduction.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold">{metrics.sustainabilityScore.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sustainability Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Waste Management</h3>
                <p className="text-sm text-gray-600">Record and track waste disposal</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Green Initiatives</h3>
                <p className="text-sm text-gray-600">Create and track sustainability initiatives</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TreePine className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="font-semibold">Carbon Offsets</h3>
                <p className="text-sm text-gray-600">Record carbon offset activities</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Sustainability Reports</h3>
                <p className="text-sm text-gray-600">Generate sustainability reports</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {metrics && metrics.sustainabilityScore >= 80 && (
        <Card>
          <CardHeader>
            <CardTitle>Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Leaf className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Sustainability Leader</p>
                <p className="text-sm text-green-700">Your company has achieved excellent sustainability score!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

