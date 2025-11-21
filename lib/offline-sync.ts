/**
 * Offline Sync Manager
 * Handles data synchronization for offline-first mobile applications
 */

interface SyncChange {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, any>;
  timestamp: number;
}

interface SyncQueue {
  changes: SyncChange[];
  lastSyncTime: number;
}

const STORAGE_KEY = 'nexagestion_sync_queue';
const LAST_SYNC_KEY = 'nexagestion_last_sync';

export class OfflineSyncManager {
  private queue: SyncChange[] = [];
  private lastSyncTime: number = 0;

  constructor() {
    this.loadQueue();
  }

  /**
   * Load sync queue from local storage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as SyncQueue;
        this.queue = data.changes || [];
        this.lastSyncTime = data.lastSyncTime || 0;
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  /**
   * Save sync queue to local storage
   */
  private saveQueue(): void {
    try {
      const data: SyncQueue = {
        changes: this.queue,
        lastSyncTime: this.lastSyncTime,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * Add a change to the sync queue
   */
  addChange(entityType: string, entityId: string, action: 'create' | 'update' | 'delete', data: Record<string, any>): void {
    const change: SyncChange = {
      entityType,
      entityId,
      action,
      data,
      timestamp: Date.now(),
    };
    this.queue.push(change);
    this.saveQueue();
  }

  /**
   * Get all pending changes
   */
  getPendingChanges(): SyncChange[] {
    return [...this.queue];
  }

  /**
   * Clear sync queue after successful sync
   */
  clearQueue(): void {
    this.queue = [];
    this.lastSyncTime = Date.now();
    this.saveQueue();
  }

  /**
   * Sync changes with server
   */
  async syncWithServer(apiUrl: string = '/api/sync'): Promise<boolean> {
    if (this.queue.length === 0) {
      return true;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastSyncTime: new Date(this.lastSyncTime).toISOString(),
          changes: this.queue,
        }),
      });

      if (response.ok) {
        this.clearQueue();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to sync with server:', error);
      return false;
    }
  }

  /**
   * Fetch updated data from server
   */
  async fetchUpdatedData(apiUrl: string = '/api/sync'): Promise<Record<string, any> | null> {
    try {
      const lastSync = new Date(this.lastSyncTime).toISOString();
      const response = await fetch(`${apiUrl}?lastSyncTime=${encodeURIComponent(lastSync)}`);

      if (response.ok) {
        const data = await response.json();
        this.lastSyncTime = Date.now();
        this.saveQueue();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch updated data:', error);
      return null;
    }
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date {
    return new Date(this.lastSyncTime);
  }

  /**
   * Check if there are pending changes
   */
  hasPendingChanges(): boolean {
    return this.queue.length > 0;
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

// Export singleton instance
export const offlineSyncManager = new OfflineSyncManager();

