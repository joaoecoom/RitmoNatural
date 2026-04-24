"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";

export function AppearanceRoot({
  appearance,
  pushNotifications,
  soundscapeEnabled,
  children,
}: PropsWithChildren<{
  appearance: string;
  pushNotifications: boolean;
  soundscapeEnabled: boolean;
}>) {
  useEffect(() => {
    document.documentElement.dataset.appearance = appearance;
    document.documentElement.dataset.pushNotifications = pushNotifications
      ? "on"
      : "off";
    document.documentElement.dataset.soundscape = soundscapeEnabled ? "on" : "off";

    return () => {
      delete document.documentElement.dataset.appearance;
      delete document.documentElement.dataset.pushNotifications;
      delete document.documentElement.dataset.soundscape;
    };
  }, [appearance, pushNotifications, soundscapeEnabled]);

  return <>{children}</>;
}
