export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  startUrl: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'portrait-primary' | 'landscape-primary';
  backgroundColor: string;
  themeColor: string;
  icons: PWAIcon[];
  screenshots: PWAScreenshot[];
  categories: string[];
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface PWAScreenshot {
  src: string;
  sizes: string;
  type: string;
  form_factor?: 'narrow' | 'wide';
}

export interface OfflineData {
  id: string;
  companyId: string;
  userId: string;
  endpoint: string;
  method: string;
  data: any;
  timestamp: Date;
  synced: boolean;
}

export class PWAService {
  private config: PWAConfig | null = null;
  private offlineQueue: Map<string, OfflineData> = new Map();
  private syncStatus: Map<string, boolean> = new Map();

  async initializePWA(config: PWAConfig): Promise<PWAConfig> {
    this.config = config;
    console.log(`PWA initialized: ${config.name}`);
    return config;
  }

  getConfig(): PWAConfig | null {
    return this.config;
  }

  async generateManifest(): Promise<any> {
    if (!this.config) {
      throw new Error('PWA not initialized');
    }

    return {
      name: this.config.name,
      short_name: this.config.shortName,
      description: this.config.description,
      start_url: this.config.startUrl,
      display: this.config.display,
      orientation: this.config.orientation,
      background_color: this.config.backgroundColor,
      theme_color: this.config.themeColor,
      icons: this.config.icons,
      screenshots: this.config.screenshots,
      categories: this.config.categories,
    };
  }

  async queueOfflineRequest(
    companyId: string,
    userId: string,
    endpoint: string,
    method: string,
    data: any
  ): Promise<OfflineData> {
    const offlineData: OfflineData = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      userId,
      endpoint,
      method,
      data,
      timestamp: new Date(),
      synced: false,
    };

    this.offlineQueue.set(offlineData.id, offlineData);
    console.log(`Queued offline request: ${endpoint}`);
    return offlineData;
  }

  async getOfflineQueue(companyId: string): Promise<OfflineData[]> {
    const queue = Array.from(this.offlineQueue.values()).filter(
      (item) => item.companyId === companyId && !item.synced
    );
    return queue;
  }

  async markAsSynced(requestId: string): Promise<void> {
    const request = this.offlineQueue.get(requestId);
    if (request) {
      request.synced = true;
      this.offlineQueue.set(requestId, request);
      console.log(`Marked as synced: ${requestId}`);
    }
  }

  async clearSyncedRequests(companyId: string): Promise<number> {
    let count = 0;
    for (const [id, request] of this.offlineQueue) {
      if (request.companyId === companyId && request.synced) {
        this.offlineQueue.delete(id);
        count++;
      }
    }
    console.log(`Cleared ${count} synced requests`);
    return count;
  }

  async getSyncStatus(companyId: string): Promise<{
    isSyncing: boolean;
    pendingRequests: number;
    syncedRequests: number;
    lastSyncTime?: Date;
  }> {
    const queue = Array.from(this.offlineQueue.values()).filter(
      (item) => item.companyId === companyId
    );

    const pendingRequests = queue.filter((item) => !item.synced).length;
    const syncedRequests = queue.filter((item) => item.synced).length;
    const isSyncing = this.syncStatus.get(companyId) || false;

    return {
      isSyncing,
      pendingRequests,
      syncedRequests,
      lastSyncTime: queue.length > 0 ? queue[queue.length - 1].timestamp : undefined,
    };
  }

  async startSync(companyId: string): Promise<void> {
    this.syncStatus.set(companyId, true);
    console.log(`Started sync for company: ${companyId}`);
  }

  async completeSync(companyId: string): Promise<void> {
    this.syncStatus.set(companyId, false);
    console.log(`Completed sync for company: ${companyId}`);
  }

  async getInstallPromptStatus(): Promise<{
    canInstall: boolean;
    isInstalled: boolean;
    isStandalone: boolean;
  }> {
    return {
      canInstall: true,
      isInstalled: false,
      isStandalone: false,
    };
  }

  async enableNotifications(): Promise<boolean> {
    console.log('Notifications enabled');
    return true;
  }

  async disableNotifications(): Promise<boolean> {
    console.log('Notifications disabled');
    return false;
  }

  async getNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
    return 'default';
  }
}

export const pwaService = new PWAService();

