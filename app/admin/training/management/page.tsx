'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

interface TrainingMetrics {
  totalPrograms: number;
  activePrograms: number;
  totalSessions: number;
  completedSessions: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageScore: number;
  completionRate: number;
}

export default function TrainingManagementPage() {
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingMetrics();
  }, []);

  const fetchTrainingMetrics = async () => {
    try {
      const response = await fetch('/api/training/management?action=metrics');
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
    return <div className="p-8">Loading training information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Training Management
          </h1>
          <p className="text-gray-600">Manage training programs and sessions</p>
        </div>
        <Button>Create Program</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Training Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold">{metrics.totalPrograms}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activePrograms}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="text-2xl font-bold">{metrics.totalSessions}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedSessions}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Enrollments</p>
                <p className="text-2xl font-bold">{metrics.totalEnrollments}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedEnrollments}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{metrics.averageScore.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-2xl font-bold">{metrics.completionRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Training Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Training Programs</h3>
                <p className="text-sm text-gray-600">Create and manage programs</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Training Sessions</h3>
                <p className="text-sm text-gray-600">Schedule and manage sessions</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Employee Enrollments</h3>
                <p className="text-sm text-gray-600">Manage employee enrollments</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Training Analytics</h3>
                <p className="text-sm text-gray-600">View training analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

