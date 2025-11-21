'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, MessageSquare, Plus } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: string;
  owner: { firstName: string; lastName: string };
  collaborators: string[];
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  user: { firstName: string; lastName: string };
  createdAt: string;
}

export default function CollaborationDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDocTitle, setNewDocTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, messagesRes] = await Promise.all([
          fetch('/api/collaboration/documents?limit=10'),
          fetch('/api/collaboration/chat?channelId=general&limit=20'),
        ]);

        const docsData = await docsRes.json();
        const messagesData = await messagesRes.json();

        setDocuments(docsData);
        setMessages(messagesData);
      } catch (error) {
        console.error('Failed to fetch collaboration data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;

    try {
      const response = await fetch('/api/collaboration/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDocTitle,
          content: '',
          type: 'document',
        }),
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([newDoc, ...documents]);
        setNewDocTitle('');
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading collaboration data...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Team Collaboration</h1>
        <p className="text-gray-600">Real-time collaboration, documents, and team communication</p>
      </div>

      {/* Create Document */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Document title..."
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <Button onClick={handleCreateDocument} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shared Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Shared Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm text-gray-600">
                    {doc.owner.firstName} {doc.owner.lastName} • {doc.collaborators.length} collaborators
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Open
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Team Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-sm">{msg.user.firstName} {msg.user.lastName}</p>
                <p className="text-sm text-gray-700">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Collaborators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-4 border rounded">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium">User {i}</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

