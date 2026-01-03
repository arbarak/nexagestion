import { prisma } from './prisma';

export interface WebSocketMessage {
  type: 'join' | 'leave' | 'update' | 'sync' | 'cursor' | 'presence' | 'notification' | 'heartbeat';
  roomId: string;
  userId: string;
  companyId: string;
  data?: Record<string, any>;
  timestamp?: Date;
  clientId?: string;
}

export interface CollaborationRoom {
  id: string;
  entityType: 'invoice' | 'sale' | 'product' | 'client' | 'dashboard' | 'report';
  entityId: string;
  companyId: string;
  activeUsers: CollaborationUser[];
  lastActivity: Date;
  version: number;
  locked?: boolean;
  lockedBy?: string;
}

export interface CollaborationUser {
  userId: string;
  userName: string;
  userEmail: string;
  joinedAt: Date;
  lastSeen: Date;
  cursor?: { x: number; y: number; field?: string };
  clientId: string;
  isTyping?: boolean;
}

export interface RealtimeUpdate {
  id: string;
  roomId: string;
  entityType: string;
  entityId: string;
  userId: string;
  changeType: 'create' | 'update' | 'delete' | 'comment';
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  createdAt: Date;
  version: number;
}

export class WebSocketService {
  private rooms: Map<string, CollaborationRoom> = new Map();
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> roomIds
  private messageQueue: WebSocketMessage[] = [];
  private maxRoomSize = 50;
  private heartbeatInterval = 30000; // 30 seconds
  private inactivityTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Create or get a collaboration room
   */
  async createRoom(
    entityType: string,
    entityId: string,
    companyId: string
  ): Promise<CollaborationRoom> {
    const roomId = `${entityType}:${entityId}`;

    let room = this.rooms.get(roomId);

    if (!room) {
      room = {
        id: roomId,
        entityType: entityType as any,
        entityId,
        companyId,
        activeUsers: [],
        lastActivity: new Date(),
        version: 0,
      };
      this.rooms.set(roomId, room);
    }

    return room;
  }

  /**
   * User joins a collaboration room
   */
  async joinRoom(
    roomId: string,
    userId: string,
    userName: string,
    userEmail: string,
    companyId: string,
    clientId: string
  ): Promise<{ room: CollaborationRoom; snapshot: Record<string, any> }> {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    // Verify company access
    if (room.companyId !== companyId) {
      throw new Error('Unauthorized access to room');
    }

    // Check room capacity
    if (room.activeUsers.length >= this.maxRoomSize) {
      throw new Error('Room is full');
    }

    // Remove duplicate connections from same user
    const existingUserIndex = room.activeUsers.findIndex((u) => u.userId === userId);
    if (existingUserIndex >= 0) {
      room.activeUsers.splice(existingUserIndex, 1);
    }

    // Add user to room
    const user: CollaborationUser = {
      userId,
      userName,
      userEmail,
      joinedAt: new Date(),
      lastSeen: new Date(),
      clientId,
    };

    room.activeUsers.push(user);

    // Track user connection
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(roomId);

    // Get entity snapshot for new user
    const snapshot = await this.getEntitySnapshot(room.entityType, room.entityId);

    // Broadcast user presence
    this.broadcastToRoom(roomId, {
      type: 'presence',
      roomId,
      userId: 'system',
      companyId,
      data: {
        action: 'user_joined',
        user,
        activeUsers: room.activeUsers,
      },
    });

    return { room, snapshot };
  }

  /**
   * User leaves a collaboration room
   */
  async leaveRoom(roomId: string, userId: string, companyId: string): Promise<void> {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    // Remove user from room
    const userIndex = room.activeUsers.findIndex((u) => u.userId === userId);
    if (userIndex >= 0) {
      room.activeUsers.splice(userIndex, 1);
    }

    // Update user connections
    const userRooms = this.userConnections.get(userId);
    if (userRooms) {
      userRooms.delete(roomId);
    }

    // Broadcast user left
    this.broadcastToRoom(roomId, {
      type: 'presence',
      roomId,
      userId: 'system',
      companyId,
      data: {
        action: 'user_left',
        userId,
        activeUsers: room.activeUsers,
      },
    });

    // Clean up empty rooms
    if (room.activeUsers.length === 0) {
      this.rooms.delete(roomId);
    }
  }

  /**
   * Process a real-time update
   */
  async processUpdate(message: WebSocketMessage): Promise<RealtimeUpdate> {
    const room = this.rooms.get(message.roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    const update: RealtimeUpdate = {
      id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId: message.roomId,
      entityType: room.entityType,
      entityId: room.entityId,
      userId: message.userId,
      changeType: message.data?.changeType || 'update',
      fieldName: message.data?.fieldName,
      oldValue: message.data?.oldValue,
      newValue: message.data?.newValue,
      createdAt: new Date(),
      version: room.version + 1,
    };

    room.version = update.version;
    room.lastActivity = new Date();

    // Persist update to database
    await this.persistUpdate(update);

    // Broadcast update to all users in room
    this.broadcastToRoom(message.roomId, {
      type: 'update',
      roomId: message.roomId,
      userId: message.userId,
      companyId: message.companyId,
      data: update,
    });

    return update;
  }

  /**
   * Update user cursor position
   */
  updateUserCursor(
    roomId: string,
    userId: string,
    x: number,
    y: number,
    field?: string
  ): void {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const user = room.activeUsers.find((u) => u.userId === userId);

    if (user) {
      user.cursor = { x, y, field };
      user.lastSeen = new Date();

      // Broadcast cursor update
      this.broadcastToRoom(roomId, {
        type: 'cursor',
        roomId,
        userId,
        companyId: room.companyId,
        data: {
          userId,
          userName: user.userName,
          cursor: user.cursor,
        },
      });
    }
  }

  /**
   * Update typing status
   */
  updateTypingStatus(roomId: string, userId: string, isTyping: boolean): void {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const user = room.activeUsers.find((u) => u.userId === userId);

    if (user) {
      user.isTyping = isTyping;

      this.broadcastToRoom(roomId, {
        type: 'presence',
        roomId,
        userId,
        companyId: room.companyId,
        data: {
          action: 'typing_status_changed',
          userId,
          isTyping,
        },
      });
    }
  }

  /**
   * Lock entity for exclusive editing
   */
  async lockEntity(roomId: string, userId: string, companyId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    if (room.locked && room.lockedBy !== userId) {
      return false;
    }

    room.locked = true;
    room.lockedBy = userId;

    this.broadcastToRoom(roomId, {
      type: 'sync',
      roomId,
      userId: 'system',
      companyId,
      data: {
        action: 'entity_locked',
        lockedBy: userId,
      },
    });

    return true;
  }

  /**
   * Unlock entity
   */
  async unlockEntity(roomId: string, userId: string, companyId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    if (room.lockedBy !== userId) {
      return false;
    }

    room.locked = false;
    room.lockedBy = undefined;

    this.broadcastToRoom(roomId, {
      type: 'sync',
      roomId,
      userId: 'system',
      companyId,
      data: {
        action: 'entity_unlocked',
      },
    });

    return true;
  }

  /**
   * Get room information
   */
  getRoom(roomId: string): CollaborationRoom | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get user's active rooms
   */
  getUserRooms(userId: string): CollaborationRoom[] {
    const roomIds = this.userConnections.get(userId) || new Set();
    return Array.from(roomIds)
      .map((roomId) => this.rooms.get(roomId))
      .filter((room) => room !== undefined) as CollaborationRoom[];
  }

  /**
   * Get collaboration history for an entity
   */
  async getCollaborationHistory(
    entityType: string,
    entityId: string,
    limit: number = 50
  ): Promise<RealtimeUpdate[]> {
    return prisma.realtimeUpdate.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Broadcast message to all users in a room
   */
  private broadcastToRoom(roomId: string, message: WebSocketMessage): void {
    this.messageQueue.push(message);

    // In production, broadcast to all connected clients
    // This would integrate with actual WebSocket connections
  }

  /**
   * Get entity snapshot for collaboration
   */
  private async getEntitySnapshot(
    entityType: string,
    entityId: string
  ): Promise<Record<string, any>> {
    switch (entityType) {
      case 'invoice':
        return (
          (await prisma.invoice.findUnique({
            where: { id: entityId },
            include: { client: true, sale: true },
          })) || {}
        );

      case 'sale':
        return (
          (await prisma.sale.findUnique({
            where: { id: entityId },
            include: { client: true, items: true },
          })) || {}
        );

      case 'product':
        return (
          (await prisma.product.findUnique({
            where: { id: entityId },
            include: { category: true, brand: true },
          })) || {}
        );

      case 'client':
        return (
          (await prisma.client.findUnique({
            where: { id: entityId },
          })) || {}
        );

      case 'dashboard':
      case 'report':
        // Dashboard/Report snapshots are application-specific
        return { type: entityType, id: entityId };

      default:
        return {};
    }
  }

  /**
   * Persist real-time update to database
   */
  private async persistUpdate(update: RealtimeUpdate): Promise<void> {
    try {
      await prisma.realtimeUpdate.create({
        data: {
          entityType: update.entityType,
          entityId: update.entityId,
          userId: update.userId,
          changeType: update.changeType,
          fieldName: update.fieldName,
          oldValue: update.oldValue ? JSON.stringify(update.oldValue) : null,
          newValue: update.newValue ? JSON.stringify(update.newValue) : null,
          version: update.version,
        },
      });
    } catch (error) {
      console.error('Failed to persist real-time update:', error);
    }
  }

  /**
   * Clean up inactive users
   */
  async cleanupInactiveUsers(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      const inactiveUsers = room.activeUsers.filter((user) => {
        const inactiveTime = now.getTime() - user.lastSeen.getTime();
        return inactiveTime > this.inactivityTimeout;
      });

      for (const user of inactiveUsers) {
        await this.leaveRoom(roomId, user.userId, room.companyId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get collaboration statistics
   */
  getStatistics(): {
    activeRooms: number;
    activeUsers: number;
    totalUpdates: number;
    messagesToProcess: number;
  } {
    let activeUsers = 0;

    for (const room of this.rooms.values()) {
      activeUsers += room.activeUsers.length;
    }

    return {
      activeRooms: this.rooms.size,
      activeUsers,
      totalUpdates: 0, // Would come from database
      messagesToProcess: this.messageQueue.length,
    };
  }
}

export const websocketService = new WebSocketService();
