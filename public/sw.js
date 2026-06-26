// public/sw.js - PWA Web Push Service Worker

self.addEventListener('push', function(event) {
    if (!event.data) {
        console.warn('[Service Worker] Push event received with no data.');
        return;
    }

    let payload;
    try {
        payload = event.data.json();
    } catch (e) {
        payload = { title: '자산 플래너 알림', body: event.data.text() };
    }

    const options = {
        body: payload.body || '새로운 자산 변동 사항이 있습니다.',
        icon: payload.icon || 'https://cdn-icons-png.flaticon.com/512/2503/2503939.png',
        badge: payload.badge || 'https://cdn-icons-png.flaticon.com/512/2503/2503939.png',
        vibrate: payload.vibrate || [100, 50, 100],
        data: {
            url: payload.url || self.location.origin
        }
    };

    event.waitUntil(
        self.registration.showNotification(payload.title || '자산 플래너', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click received.');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            const targetUrl = event.notification.data.url;
            
            // 이미 열려 있는 탭이 있으면 활성화하고 그 주소로 이동
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // 열려 있는 탭이 없으면 새 창 열기
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
