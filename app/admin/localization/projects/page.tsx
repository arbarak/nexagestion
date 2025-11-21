'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

interface TranslationProject {
  id: string;
  name: string;
  sourceLanguage: string;
  targetLanguages: string[];
  completionPercentage: Record<string, number>;
  status: 'draft' | 'in-progress' | 'review' | 'completed';
  createdAt: Date;
}

export default function TranslationProjectsPage() {
  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sourceLanguage: 'en',
    targetLanguages: [] as string[],
    description: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/localization/projects');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!formData.name || formData.targetLanguages.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/localization/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setShowForm(false);
      setFormData({
        name: '',
        sourceLanguage: 'en',
        targetLanguages: [],
        description: '',
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;

    try {
      const response = await fetch(`/api/localization/projects?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Translation Projects</h1>
          <p className="text-gray-600">Manage translation projects and track progress</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Translation Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Q1 2024 Localization"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source Language</label>
                <select
                  value={formData.sourceLanguage}
                  onChange={(e) => setFormData({ ...formData, sourceLanguage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Languages</label>
                <div className="space-y-2">
                  {['es', 'fr', 'de', 'it', 'pt', 'ar', 'zh', 'ja'].map((lang) => (
                    <label key={lang} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.targetLanguages.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              targetLanguages: [...formData.targetLanguages, lang],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              targetLanguages: formData.targetLanguages.filter(l => l !== lang),
                            });
                          }
                        }}
                      />
                      {lang.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project description..."
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateProject}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No projects yet</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-sm text-gray-600">
                        {project.sourceLanguage.toUpperCase()} → {project.targetLanguages.map(l => l.toUpperCase()).join(', ')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {project.targetLanguages.map((lang) => (
                      <div key={lang} className="flex items-center justify-between">
                        <span className="text-sm">{lang.toUpperCase()}</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${project.completionPercentage[lang] || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">
                            {project.completionPercentage[lang] || 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

