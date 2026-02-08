self.addEventListener('push', function (event) {
    const data = event.data.json();
    console.log('Push received...', data);

    const title = data.title || 'New Notification';
    const options = {
        body: data.body || 'You have a new message',
        icon: '/assets/avp-logo.png', // Updated icon
        badge: '/assets/avp-logo.png', // Updated badge
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.');
    event.notification.close();

    const urlToOpen = new URL(event.notification.data.url || '/dashboard', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // 1. Try to find exact URL match
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }

            // 2. Try to find any app window (same origin) and navigate it
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    return client.focus().then((focusedClient) => {
                        if (focusedClient.navigate) {
                            return focusedClient.navigate(urlToOpen);
                        }
                    });
                }
            }

            // 3. Open new window if no client found
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
