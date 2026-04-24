"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Regista o service worker e subscreve Web Push quando as definições e o VAPID estão ativos.
 */
export function WebPushRegister() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    const vapidRaw = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY?.trim();
    if (!vapidRaw || typeof window === "undefined") {
      return;
    }

    if (document.documentElement.dataset.pushNotifications !== "on") {
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    const vapidPublic = vapidRaw;

    let cancelled = false;

    async function run() {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        const permission = await Notification.requestPermission();
        if (permission !== "granted" || cancelled) {
          return;
        }

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublic),
        });

        const json = sub.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          return;
        }

        const key = JSON.stringify(json);
        if (lastSent.current === key) {
          return;
        }
        lastSent.current = key;

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            subscription: json,
            userAgent: navigator.userAgent,
          }),
        });
      } catch (error) {
        console.error("[WEB_PUSH_REGISTER]", error);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
