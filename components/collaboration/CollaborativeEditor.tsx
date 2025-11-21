'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Users, MessageSquare } from 'lucide-react';

interface ActiveUser {
  userId: string;
  userName: string;
  color: string;
  cursor?: { line: number; column: number };
}

interface CollaborativeEditorProps {
  documentId: string;
  userId: string;
  userName: string;
  initialContent: string;
  onContentChange: (content: string) => void;
}

export default function CollaborativeEditor({
  documentId,
  userId,
  userName,
  initialContent,
  onContentChange,
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
      newSocket.emit('join-document', { documentId, userId, userName });
    });

    newSocket.on('user-joined', (data: { activeUsers: ActiveUser[] }) => {
      setActiveUsers(data.activeUsers);
    });

    newSocket.on('document-changed', (data: any) => {
      if (data.userId !== userId) {
        setContent(data.data.content);
      }
    });

    newSocket.on('cursor-updated', (data: any) => {
      setActiveUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId ? { ...u, cursor: data.cursor } : u
        )
      );
    });

    newSocket.on('user-left', (data: { activeUsers: ActiveUser[] }) => {
      setActiveUsers(data.activeUsers);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-document', { documentId, userId });
      newSocket.disconnect();
    };
  }, [documentId, userId, userName]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange(newContent);

    // Emit edit event
    if (socket) {
      socket.emit('document-edit', {
        type: 'edit',
        userId,
        userName,
        documentId,
        data: { content: newContent },
        timestamp: Date.now(),
      });
    }
  };

  const handleCursorMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (socket && textareaRef.current) {
      const textarea = textareaRef.current;
      const position = textarea.selectionStart;
      const line = textarea.value.substring(0, position).split('\n').length - 1;
      const column = position - textarea.value.lastIndexOf('\n', position - 1) - 1;

      socket.emit('cursor-move', {
        type: 'cursor',
        userId,
        userName,
        documentId,
        data: { line, column },
        timestamp: Date.now(),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Users */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">Active Collaborators:</span>
        <div className="flex gap-2">
          {activeUsers.map((user) => (
            <div
              key={user.userId}
              className="px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.userName}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="border rounded-lg overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onMouseMove={handleCursorMove}
          onKeyUp={handleCursorMove}
          className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none"
          placeholder="Start typing to collaborate..."
        />
      </div>

      {/* Cursor Indicators */}
      <div className="space-y-2">
        {activeUsers
          .filter((u) => u.cursor)
          .map((user) => (
            <div key={user.userId} className="text-xs text-gray-600">
              <span style={{ color: user.color }} className="font-medium">
                {user.userName}
              </span>
              {' is at line '}
              <span className="font-mono">{user.cursor?.line}</span>
              {', column '}
              <span className="font-mono">{user.cursor?.column}</span>
            </div>
          ))}
      </div>

      {/* Comments Section */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">Comments</span>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
    </div>
  );
}

