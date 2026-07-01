"use client";

/** 탭 간 Hero 배경 즉시 반영용 */
export const SITE_SETTINGS_BROADCAST_CHANNEL = "site-settings";

export type SiteSettingsBroadcastMessage = {
  key: string;
  value: string;
};

export function broadcastSiteSetting(message: SiteSettingsBroadcastMessage): void {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return;
  }

  const channel = new BroadcastChannel(SITE_SETTINGS_BROADCAST_CHANNEL);
  channel.postMessage(message);
  channel.close();
}

export function subscribeSiteSetting(
  key: string,
  onUpdate: (value: string) => void,
): () => void {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return () => {};
  }

  const channel = new BroadcastChannel(SITE_SETTINGS_BROADCAST_CHANNEL);

  channel.onmessage = (event: MessageEvent<SiteSettingsBroadcastMessage>) => {
    if (event.data?.key === key && event.data.value) {
      onUpdate(event.data.value);
    }
  };

  return () => channel.close();
}
