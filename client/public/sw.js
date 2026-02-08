self.addEventListener("push", (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body,
        icon: "/logo-192.png",
        badge: "/badge-72.png",
        tag: "range-note",
        renotify: false,
        data: {
            url: data.url
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = new URL(event.notification.data.url || '/dashboard', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((clientList) => {
            // Look for a tab that includes the dashboard path
            for (const client of clientList) {
                if (client.url.includes("/dashboard") && "focus" in client) {
                    return client.focus();
                }
            }

            // If no tab found, open new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
