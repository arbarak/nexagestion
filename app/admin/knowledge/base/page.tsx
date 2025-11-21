'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Folder, MessageSquare, TrendingUp } from 'lucide-react';

interface KnowledgeMetrics {
  totalArticles: number;
  publishedArticles: number;
  totalCategories: number;
  activeCategories: number;
  totalComments: number;
  approvedComments: number;
  totalViews: number;
  knowledgeScore: number;
}

export default function KnowledgeBasePage() {
  const [metrics, setMetrics] = useState<KnowledgeMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/knowledge/base?action=metrics');
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
    return <div className="p-8">Loading knowledge base information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Knowledge Base
          </h1>
          <p className="text-gray-600">Manage articles, categories, and comments</p>
        </div>
        <Button>New Article</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Articles</p>
                <p className="text-2xl font-bold">{metrics.totalArticles}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold">{metrics.publishedArticles}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{metrics.totalCategories}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeCategories}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Comments</p>
                <p className="text-2xl font-bold">{metrics.totalComments}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{metrics.approvedComments}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Views</p>
                <p className="text-2xl font-bold">{metrics.totalViews}</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold">{metrics.knowledgeScore.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Articles</h3>
                <p className="text-sm text-gray-600">Manage knowledge articles</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Categories</h3>
                <p className="text-sm text-gray-600">Manage categories</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Comments</h3>
                <p className="text-sm text-gray-600">Manage comments</p>
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

