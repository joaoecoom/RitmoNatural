self.addEventListener("push", (event) => {
  let payload = { title: "Ritmo Natural", body: "" };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    payload.body = event.data?.text() ?? "";
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Ritmo Natural", {
      body: payload.body || "",
      icon: "/brand/ritmo-natural-logo.png",
      badge: "/brand/ritmo-natural-logo.png",
      data: payload.data ?? {},
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/today";
  event.waitUntil(self.clients.openWindow(url));
});
