'use client';

import { useEffect, useState, useCallback } from 'react';

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export interface UseServiceWorkerReturn {
  status: ServiceWorkerStatus;
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  skipWaiting: () => void;
  clearCache: () => Promise<void>;
}

/**
 * Hook for managing Service Worker registration and lifecycle
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    isRegistered: false,
    isOnline: typeof window !== 'undefined' && window.navigator.onLine,
    updateAvailable: false,
    registration: null,
  });

  const register = useCallback(async () => {
    if (!status.isSupported) {
      console.warn('Service Workers are not supported in this browser');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      console.log('Service Worker registered:', registration);

      setStatus((prev) => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every 60 seconds

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              setStatus((prev) => ({
                ...prev,
                updateAvailable: true,
              }));

              console.log('Service Worker update available');
            }
          });
        }
      });
    } catch (error) {
      console.error('Failed to register Service Worker:', error);
    }
  }, [status.isSupported]);

  const unregister = useCallback(async () => {
    try {
      if (status.registration) {
        const success = await status.registration.unregister();

        if (success) {
          setStatus((prev) => ({
            ...prev,
            isRegistered: false,
            registration: null,
          }));

          console.log('Service Worker unregistered');
        }
      }
    } catch (error) {
      console.error('Failed to unregister Service Worker:', error);
    }
  }, [status.registration]);

  const skipWaiting = useCallback(() => {
    if (status.registration?.waiting) {
      status.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload page when new service worker activates
      let hasReloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hasReloaded) {
          hasReloaded = true;
          window.location.reload();
        }
      });
    }
  }, [status.registration]);

  const clearCache = useCallback(async () => {
    if (navigator.serviceWorker.controller) {
      return new Promise<void>((resolve) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('Cache cleared');
            resolve();
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );

        // Timeout after 5 seconds
        setTimeout(() => resolve(), 5000);
      });
    }
  }, []);

  // Register service worker on mount
  useEffect(() => {
    register();
  }, [register]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
      console.log('Application is online');
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
      console.log('Application is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    status,
    register,
    unregister,
    skipWaiting,
    clearCache,
  };
}

/**
 * Hook for detecting offline status and syncing data
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' && window.navigator.onLine
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored - syncing offline data');

      // Trigger background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.sync.register('sync-offline-actions');
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost - entering offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

/**
 * Hook for managing PWA installation prompts
 */
export function usePWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA installed');
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }

    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
      setDeferredPrompt(null);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  return { isInstallable, promptInstall };
}
