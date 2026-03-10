/* ==============================================================
   MahaVidya Service Worker — Rural-First PWA
   Implements Cache-First strategy + Background Sync stub
   ============================================================== */

const CACHE_NAME = 'mahavidya-v1';
const OFFLINE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/zp_school_real.jpg',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install: Cache all essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[PWA] Caching offline assets...');
                return cache.addAll(OFFLINE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch: Cache-first, fallback to network
self.addEventListener('fetch', (event) => {
    // Don't intercept API or POST requests
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                return response;
            }).catch(() => {
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

// Background Sync — Offline Attendance Marking
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-attendance') {
        event.waitUntil(syncOfflineAttendance());
    }
});

async function syncOfflineAttendance() {
    const db = await openOfflineDB();
    const records = await db.getAll('offline-attendance');
    for (const record of records) {
        try {
            await fetch('/api/attendance/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            await db.delete('offline-attendance', record.id);
            console.log('[PWA] Synced offline record:', record.id);
        } catch (e) {
            console.warn('[PWA] Sync failed, will retry:', e);
        }
    }
}

function openOfflineDB() {
    return new Promise((resolve) => {
        // IndexedDB stub for demo purposes
        resolve({ getAll: async () => [], delete: async () => {} });
    });
}
