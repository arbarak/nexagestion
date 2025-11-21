'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Plus, Edit2, Trash2 } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  enabled: boolean;
}

export default function LocalizationPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nativeName: '',
    direction: 'ltr' as 'ltr' | 'rtl',
  });

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/localization/languages');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setLanguages(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLanguage = async (code: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/localization/languages?code=${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (!response.ok) throw new Error('Failed to update');
      const updated = await response.json();
      setLanguages(languages.map(l => l.code === code ? updated : l));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update language');
    }
  };

  if (loading) {
    return <div className="p-8">Loading languages...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Localization & Languages
          </h1>
          <p className="text-gray-600">Manage supported languages and translations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map((language) => (
          <Card key={language.code}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{language.name}</h3>
                  <p className="text-sm text-gray-600">{language.nativeName}</p>
                  <p className="text-xs text-gray-500 mt-1">Code: {language.code}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Direction: <span className="font-semibold">{language.direction.toUpperCase()}</span>
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      language.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {language.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={language.enabled ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleToggleLanguage(language.code, language.enabled)}
                  >
                    {language.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Translation Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Languages</p>
              <p className="text-2xl font-bold">{languages.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Enabled Languages</p>
              <p className="text-2xl font-bold">{languages.filter(l => l.enabled).length}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">RTL Languages</p>
              <p className="text-2xl font-bold">{languages.filter(l => l.direction === 'rtl').length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Manage Translations
          </Button>
          <Button className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Translation Project
          </Button>
          <Button className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Export Translations
          </Button>
          <Button className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Import Translations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

