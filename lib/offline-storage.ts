/**
 * Offline Storage Service
 * Manages IndexedDB for offline data persistence and sync
 */

export interface OfflineAction {
  id: string;
  timestamp: Date;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: string;
  status: 'pending' | 'synced' | 'failed';
  retries: number;
}

export interface OfflineData {
  id: string;
  entity: 'sale' | 'invoice' | 'product' | 'client' | 'employee';
  data: Record<string, any>;
  timestamp: Date;
  synced: boolean;
}

export class OfflineStorageService {
  private dbName = 'nexagestion';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
          actionStore.createIndex('status', 'status', { unique: false });
          actionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlineData')) {
          const dataStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          dataStore.createIndex('entity', 'entity', { unique: false });
          dataStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }

        console.log('IndexedDB schema created');
      };
    });
  }

  /**
   * Save offline action
   */
  async saveOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<string> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineAction: OfflineAction = {
      ...action,
      id,
      timestamp: new Date(),
      retries: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.add(offlineAction);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Offline action saved:', id);
        resolve(id);
      };
    });
  }

  /**
   * Get pending offline actions
   */
  async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as OfflineAction[]);
    });
  }

  /**
   * Update offline action status
   */
  async updateActionStatus(id: string, status: OfflineAction['status']): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const action = request.result as OfflineAction;
        action.status = status;

        const updateRequest = store.put(action);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => {
          console.log('Action status updated:', id, status);
          resolve();
        };
      };
    });
  }

  /**
   * Delete offline action
   */
  async deleteOfflineAction(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Offline action deleted:', id);
        resolve();
      };
    });
  }

  /**
   * Save offline data
   */
  async saveOfflineData(
    entity: OfflineData['entity'],
    data: Record<string, any>
  ): Promise<string> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    const id = `${entity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      entity,
      data,
      timestamp: new Date(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.add(offlineData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Offline data saved:', id);
        resolve(id);
      };
    });
  }

  /**
   * Get unsynced offline data
   */
  async getUnsyncedData(entity?: OfflineData['entity']): Promise<OfflineData[]> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');

      let request;
      if (entity) {
        // Get unsynced data for specific entity type
        request = store.getAll();
      } else {
        request = index.getAll(false);
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result as OfflineData[];
        const filtered = entity ? data.filter((d) => d.entity === entity && !d.synced) : data;
        resolve(filtered);
      };
    });
  }

  /**
   * Mark offline data as synced
   */
  async markAsSynced(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result as OfflineData;
        data.synced = true;

        const updateRequest = store.put(data);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => {
          console.log('Data marked as synced:', id);
          resolve();
        };
      };
    });
  }

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ['offlineActions', 'offlineData', 'syncQueue'],
        'readwrite'
      );

      const stores = [
        transaction.objectStore('offlineActions'),
        transaction.objectStore('offlineData'),
        transaction.objectStore('syncQueue'),
      ];

      let completed = 0;

      for (const store of stores) {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          completed++;
          if (completed === stores.length) {
            console.log('All offline data cleared');
            resolve();
          }
        };
      }
    });
  }

  /**
   * Get offline storage statistics
   */
  async getStats(): Promise<{
    pendingActions: number;
    unsyncedData: number;
    totalSize: number;
  }> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    const pendingActions = await this.getPendingActions();
    const unsyncedData = await this.getUnsyncedData();

    // Estimate size (rough calculation)
    const totalSize =
      JSON.stringify(pendingActions).length + JSON.stringify(unsyncedData).length;

    return {
      pendingActions: pendingActions.length,
      unsyncedData: unsyncedData.length,
      totalSize,
    };
  }

  /**
   * Sync offline actions when online
   */
  async syncOfflineActions(): Promise<{ success: number; failed: number }> {
    const pendingActions = await this.getPendingActions();
    let success = 0;
    let failed = 0;

    for (const action of pendingActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await this.deleteOfflineAction(action.id);
          success++;
        } else {
          failed++;
          // Increment retry count and update status if needed
          if (action.retries < 3) {
            action.retries++;
          } else {
            await this.updateActionStatus(action.id, 'failed');
          }
        }
      } catch (error) {
        console.error('Failed to sync action:', action.id, error);
        failed++;
      }
    }

    console.log(`Sync completed: ${success} succeeded, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return typeof window !== 'undefined' && window.navigator.onLine;
  }

  /**
   * Add online/offline listeners
   */
  addStatusListeners(
    onOnline: () => void,
    onOffline: () => void
  ): { remove: () => void } {
    if (typeof window === 'undefined') {
      return { remove: () => {} };
    }

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return {
      remove: () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
      },
    };
  }
}

export const offlineStorageService = new OfflineStorageService();
