'use client';

import { useEffect, useState } from 'react';
import { useServiceWorker, useOfflineSync, usePWAPrompt } from '@/lib/hooks/use-service-worker';

/**
 * PWA Initializer Component
 * Handles service worker registration and offline support
 */
export function PWAInitializer() {
  const { status, skipWaiting } = useServiceWorker();
  const { isOnline } = useOfflineSync();
  const { isInstallable, promptInstall } = usePWAPrompt();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState(!isOnline);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Show update prompt when new version available
  useEffect(() => {
    if (status.updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [status.updateAvailable]);

  // Show offline notice
  useEffect(() => {
    setShowOfflineNotice(!isOnline);
  }, [isOnline]);

  // Show install prompt
  useEffect(() => {
    if (isInstallable) {
      setShowInstallPrompt(true);
    }
  }, [isInstallable]);

  // Handle skip waiting
  const handleUpdate = () => {
    skipWaiting();
    setShowUpdatePrompt(false);
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      // Installation successful
      console.log('PWA installed');
      setShowInstallPrompt(false);
    }
  };

  return (
    <>
      {/* Update notification */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold mb-1">Update Available</h3>
              <p className="text-sm mb-3">A new version of NexaGestion is available.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50"
                >
                  Update Now
                </button>
                <button
                  onClick={() => setShowUpdatePrompt(false)}
                  className="text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="text-white hover:text-blue-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Offline notice */}
      {showOfflineNotice && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm z-40">
          ⚠️ You&apos;re offline. Changes will be synced when you&apos;re back online.
        </div>
      )}

      {/* Install prompt */}
      {showInstallPrompt && !showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold mb-1">Install App</h3>
              <p className="text-sm mb-3">Install NexaGestion for offline access and quick launch.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="bg-white text-green-500 px-3 py-1 rounded text-sm font-medium hover:bg-green-50"
                >
                  Install
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="text-white hover:text-green-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Service worker status indicator (development only) */}
      {process.env.NODE_ENV === 'development' && status.isRegistered && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded text-xs opacity-50 hover:opacity-100 transition-opacity">
          🔄 Service Worker Active
        </div>
      )}
    </>
  );
}
