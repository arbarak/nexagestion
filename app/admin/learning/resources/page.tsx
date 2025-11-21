'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Map, Users, TrendingUp } from 'lucide-react';

interface LearningMetrics {
  totalResources: number;
  activeResources: number;
  totalPaths: number;
  activePaths: number;
  totalLearners: number;
  completedLearnings: number;
  averageProgress: number;
  learningEngagement: number;
}

export default function LearningResourcesPage() {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/learning/resources?action=metrics');
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
    return <div className="p-8">Loading learning resources information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="h-8 w-8" />
            Learning Resources
          </h1>
          <p className="text-gray-600">Manage learning resources and paths</p>
        </div>
        <Button>New Resource</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Resources Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Resources</p>
                <p className="text-2xl font-bold">{metrics.totalResources}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeResources}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Paths</p>
                <p className="text-2xl font-bold">{metrics.totalPaths}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activePaths}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Learners</p>
                <p className="text-2xl font-bold">{metrics.totalLearners}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedLearnings}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold">{metrics.averageProgress.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-2xl font-bold">{metrics.learningEngagement.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Learning Resources Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Resources</h3>
                <p className="text-sm text-gray-600">Manage learning resources</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Map className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Learning Paths</h3>
                <p className="text-sm text-gray-600">Manage learning paths</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Learners</h3>
                <p className="text-sm text-gray-600">Manage learner enrollments</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

