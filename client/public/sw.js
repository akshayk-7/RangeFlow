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

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
            .then(function (clientList) {

                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];

                    if (client.url.includes(self.location.origin) && "focus" in client) {
                        client.navigate("/dashboard");
                        return client.focus();
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow("/dashboard");
                }
            })
    );
});
