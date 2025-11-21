'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Target, TrendingUp, CheckCircle } from 'lucide-react';

interface SkillsMetrics {
  totalSkills: number;
  employeesWithSkills: number;
  averageProficiency: number;
  skillGapsIdentified: number;
  developmentPlansActive: number;
  completedPlans: number;
  averageGapLevel: number;
}

export default function SkillsDevelopmentPage() {
  const [metrics, setMetrics] = useState<SkillsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillsMetrics();
  }, []);

  const fetchSkillsMetrics = async () => {
    try {
      const response = await fetch('/api/skills/development?action=metrics');
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
    return <div className="p-8">Loading skills information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Skills Development
          </h1>
          <p className="text-gray-600">Manage employee skills and development</p>
        </div>
        <Button>Create Skill</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Skills</p>
                <p className="text-2xl font-bold">{metrics.totalSkills}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold">{metrics.employeesWithSkills}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Proficiency</p>
                <p className="text-2xl font-bold">{metrics.averageProficiency.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Skill Gaps</p>
                <p className="text-2xl font-bold">{metrics.skillGapsIdentified}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold">{metrics.developmentPlansActive}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedPlans}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Gap Level</p>
                <p className="text-2xl font-bold">{metrics.averageGapLevel.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Skills Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Skill Registry</h3>
                <p className="text-sm text-gray-600">Manage organizational skills</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Employee Skills</h3>
                <p className="text-sm text-gray-600">Assign skills to employees</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Skill Gaps</h3>
                <p className="text-sm text-gray-600">Identify and track skill gaps</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Development Plans</h3>
                <p className="text-sm text-gray-600">Create development plans</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

