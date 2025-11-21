'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversationId);
        
        setMessages(prev => [
          ...prev,
          { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
          { role: 'assistant', content: data.message, timestamp: data.timestamp },
        ]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageCircle className="w-8 h-8" />
          AI Assistant
        </h1>
        <p className="text-gray-600 mt-2">Chat with our intelligent business assistant</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p>Start a conversation with the AI assistant</p>
              <p className="text-sm mt-2">Ask about sales, inventory, customers, or get help</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 border rounded-lg text-sm"
              disabled={loading}
            />
            <Button type="submit" disabled={loading} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Quick Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Prompts</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => setInput('What are my sales trends?')}>
            Sales Trends
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInput('Show low stock items')}>
            Low Stock
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInput('Top customers')}>
            Top Customers
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInput('Help')}>
            Help
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

