// Custom Web-Push handlers, imported by the generated Workbox service worker.
self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch (e) {
        payload = { title: 'SwiftMoney', body: event.data ? event.data.text() : '' };
    }

    const title = payload.title || 'SwiftMoney';
    const options = {
        body: payload.body || '',
        icon: payload.icon || '/pwa-192x192.png',
        badge: payload.badge || '/pwa-192x192.png',
        vibrate: [80, 40, 80],
        data: payload.data || { url: '/dashboard' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/dashboard';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
            for (const w of wins) {
                if (w.url.includes(url) && 'focus' in w) return w.focus();
            }
            if (self.clients.openWindow) return self.clients.openWindow(url);
        })
    );
});
