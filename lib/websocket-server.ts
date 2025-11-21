import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

interface CollaborationMessage {
  type: 'edit' | 'cursor' | 'selection' | 'comment' | 'presence';
  userId: string;
  userName: string;
  documentId: string;
  data: any;
  timestamp: number;
}

interface ActiveUser {
  userId: string;
  userName: string;
  color: string;
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
}

class WebSocketServer {
  private io: SocketIOServer;
  private activeUsers: Map<string, Map<string, ActiveUser>> = new Map();
  private documentVersions: Map<string, number> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join document room
      socket.on('join-document', (data: { documentId: string; userId: string; userName: string }) => {
        const { documentId, userId, userName } = data;
        socket.join(`doc-${documentId}`);

        // Initialize document users map
        if (!this.activeUsers.has(documentId)) {
          this.activeUsers.set(documentId, new Map());
        }

        // Add user to active users
        const users = this.activeUsers.get(documentId)!;
        users.set(userId, {
          userId,
          userName,
          color: this.generateUserColor(),
        });

        // Notify others
        this.io.to(`doc-${documentId}`).emit('user-joined', {
          userId,
          userName,
          activeUsers: Array.from(users.values()),
        });
      });

      // Handle document edits
      socket.on('document-edit', (data: CollaborationMessage) => {
        const { documentId } = data;
        
        // Increment version
        const version = (this.documentVersions.get(documentId) || 0) + 1;
        this.documentVersions.set(documentId, version);

        // Broadcast to all users in document
        this.io.to(`doc-${documentId}`).emit('document-changed', {
          ...data,
          version,
        });
      });

      // Handle cursor movements
      socket.on('cursor-move', (data: CollaborationMessage) => {
        const { documentId, userId } = data;
        const users = this.activeUsers.get(documentId);
        
        if (users && users.has(userId)) {
          const user = users.get(userId)!;
          user.cursor = data.data;
          
          this.io.to(`doc-${documentId}`).emit('cursor-updated', {
            userId,
            cursor: data.data,
          });
        }
      });

      // Handle comments
      socket.on('add-comment', (data: CollaborationMessage) => {
        const { documentId } = data;
        this.io.to(`doc-${documentId}`).emit('comment-added', data);
      });

      // Handle presence updates
      socket.on('presence-update', (data: CollaborationMessage) => {
        const { documentId, userId } = data;
        const users = this.activeUsers.get(documentId);
        
        if (users && users.has(userId)) {
          const user = users.get(userId)!;
          Object.assign(user, data.data);
          
          this.io.to(`doc-${documentId}`).emit('presence-changed', {
            activeUsers: Array.from(users.values()),
          });
        }
      });

      // Leave document
      socket.on('leave-document', (data: { documentId: string; userId: string }) => {
        const { documentId, userId } = data;
        socket.leave(`doc-${documentId}`);
        
        const users = this.activeUsers.get(documentId);
        if (users) {
          users.delete(userId);
          
          this.io.to(`doc-${documentId}`).emit('user-left', {
            userId,
            activeUsers: Array.from(users.values()),
          });
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  private generateUserColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default WebSocketServer;

