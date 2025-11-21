'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';

interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: string[];
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const notificationTypeOptions = [
    { id: 'order', label: 'Order Notifications' },
    { id: 'payment', label: 'Payment Notifications' },
    { id: 'approval', label: 'Approval Requests' },
    { id: 'alert', label: 'System Alerts' },
    { id: 'report', label: 'Report Generation' },
    { id: 'inventory', label: 'Inventory Alerts' },
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        [key]: !preferences[key],
      });
    }
  };

  const handleTypeToggle = (typeId: string) => {
    if (preferences) {
      const types = preferences.notificationTypes.includes(typeId)
        ? preferences.notificationTypes.filter(t => t !== typeId)
        : [...preferences.notificationTypes, typeId];
      setPreferences({
        ...preferences,
        notificationTypes: types,
      });
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications: preferences.emailNotifications,
          pushNotifications: preferences.pushNotifications,
          inAppNotifications: preferences.inAppNotifications,
          notificationTypes: preferences.notificationTypes,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      alert('Preferences saved successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading preferences...</div>;
  }

  if (!preferences) {
    return <div className="p-8">Failed to load preferences</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-gray-600">Manage how you receive notifications</p>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications on your mobile device</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">In-App Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications within the application</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.inAppNotifications}
              onChange={() => handleToggle('inAppNotifications')}
              className="w-5 h-5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notificationTypeOptions.map((type) => (
            <div key={type.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <input
                type="checkbox"
                id={type.id}
                checked={preferences.notificationTypes.includes(type.id)}
                onChange={() => handleTypeToggle(type.id)}
                className="w-4 h-4"
              />
              <label htmlFor={type.id} className="flex-1 cursor-pointer">
                {type.label}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg">
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}

