'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface FeedbackMetrics {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  averageResponseRate: number;
  totalFeedback: number;
  resolvedFeedback: number;
  averageRating: number;
  satisfactionScore: number;
}

export default function FeedbackManagementPage() {
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbackMetrics();
  }, []);

  const fetchFeedbackMetrics = async () => {
    try {
      const response = await fetch('/api/feedback/management?action=metrics');
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
    return <div className="p-8">Loading feedback information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Feedback Management
          </h1>
          <p className="text-gray-600">Manage surveys and customer feedback</p>
        </div>
        <Button>Create Survey</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Surveys</p>
                <p className="text-2xl font-bold">{metrics.totalSurveys}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeSurveys}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Responses</p>
                <p className="text-2xl font-bold">{metrics.totalResponses}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold">{metrics.averageResponseRate.toFixed(0)}%</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold">{metrics.totalFeedback}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{metrics.resolvedFeedback}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{metrics.satisfactionScore.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Feedback Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Surveys</h3>
                <p className="text-sm text-gray-600">Create and manage surveys</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Survey Responses</h3>
                <p className="text-sm text-gray-600">View survey responses</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Customer Feedback</h3>
                <p className="text-sm text-gray-600">Manage customer feedback</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Feedback Resolution</h3>
                <p className="text-sm text-gray-600">Track feedback resolution</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

