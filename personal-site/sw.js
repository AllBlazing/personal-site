// --- Service Worker for Offline Support and Caching ---
// This service worker caches static assets and handles image fetches for the gallery.

const CACHE_NAME = 'site-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/gallery.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Always fetch gallery images from the network for freshness
    if (event.request.url.includes('images-for-journey') || event.request.url.includes('images-for-vibe-section')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // If the request to the new path fails, try the old path
                    if (event.request.url.includes('images-for-vibe-section')) {
                        return fetch(event.request.url.replace('images-for-vibe-section', 'images-for-journey'));
                    }
                    // If both fail, return a fallback response
                    return new Response('Image not found', {
                        status: 404,
                        statusText: 'Not Found'
                    });
                })
        );
        return;
    }

    // For other requests, try cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
            .catch(() => {
                return new Response('Network error occurred', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'update-content') {
        event.waitUntil(
            fetch('/api/content')
                .then((response) => response.json())
                .then((data) => {
                    self.clients.matchAll().then((clients) => {
                        clients.forEach((client) => {
                            client.postMessage({
                                type: 'content-update',
                                data: data
                            });
                        });
                    });
                })
        );
    }
});

// --- Suggestion: To improve offline support, consider caching more static assets (CSS, JS, fonts) during the install event. ---
// Example (not implemented):
// self.addEventListener('install', (event) => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then((cache) => {
//             return cache.addAll([
//                 '/',
//                 '/index.html',
//                 '/styles.css',
//                 '/gallery.js',
//                 '/script.js',
//                 // Add more static assets as needed
//             ]);
//         })
//     );
// });
// --- End of sw.js --- 