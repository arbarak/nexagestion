// Service Worker for NexaGestion ERP
// Handles offline functionality, caching, and background sync

const CACHE_NAME = 'nexagestion-v1';
const RUNTIME_CACHE = 'nexagestion-runtime';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
];

// Cache API endpoints for offline access
const API_CACHE_PATTERNS = [
  /\/api\/employees\//,
  /\/api\/calendar\//,
  /\/api\/sales\//,
  /\/api\/inventory\//,
  /\/api\/financial\//,
  /\/api\/dashboard\//,
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching essential assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.error('Service Worker: Error caching assets', err);
      });
    })
  );

  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );

  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external resources
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle navigation requests with cache-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default to network-first strategy
  event.respondWith(networkFirstStrategy(request));
});

/**
 * Network-first strategy: Try network first, fallback to cache
 */
function networkFirstStrategy(request) {
  return fetch(request)
    .then((response) => {
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }

      // Clone and cache the response
      const responseToCache = response.clone();
      caches.open(RUNTIME_CACHE).then((cache) => {
        cache.put(request, responseToCache);
      });

      return response;
    })
    .catch(() => {
      // Network request failed, try cache
      return caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }

        return new Response('Offline - Resource not available', { status: 503 });
      });
    });
}

/**
 * Cache-first strategy: Try cache first, fallback to network
 */
function cacheFirstStrategy(request) {
  return caches.match(request).then((response) => {
    if (response) {
      return response;
    }

    return fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Both cache and network failed
        if (request.destination === 'image') {
          return new Response(null, { status: 404 });
        }

        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }

        return new Response('Offline - Resource not available', { status: 503 });
      });
  });
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync -', event.tag);

  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

/**
 * Sync offline actions when back online
 */
async function syncOfflineActions() {
  try {
    const db = await openIndexedDB();
    const offlineActions = await getOfflineActions(db);

    for (const action of offlineActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await removeOfflineAction(db, action.id);
          console.log('Service Worker: Synced action:', action.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Sync error:', error);
  }
}

/**
 * Open IndexedDB for offline storage
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nexagestion', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineActions')) {
        db.createObjectStore('offlineActions', { keyPath: 'id' });
      }
    };
  });
}

/**
 * Get offline actions from IndexedDB
 */
function getOfflineActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Remove offline action from IndexedDB
 */
function removeOfflineAction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: data.tag || 'notification',
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if window already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync -', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncDataPeriodically());
  }
});

/**
 * Periodic sync for data
 */
async function syncDataPeriodically() {
  try {
    console.log('Service Worker: Performing periodic data sync');
    // Sync important data like calendar, tasks, messages
    await Promise.all([
      fetch('/api/calendar/events').catch(() => null),
      fetch('/api/employees/attendance').catch(() => null),
      fetch('/api/sales').catch(() => null),
    ]);
  } catch (error) {
    console.error('Service Worker: Periodic sync error:', error);
  }
}

// Message handling for client communication
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received -', event.data.type);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data.type === 'CACHE_URLS') {
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(event.data.urls).then(() => {
        event.ports[0].postMessage({ success: true });
      });
    });
  }
});

console.log('Service Worker: Loaded successfully');
