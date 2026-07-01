"use client";

import type { ProjectContentSection } from "@/lib/types/project-content";

export const PROJECT_CONTENT_BROADCAST_CHANNEL = "project-content";

export type ProjectContentBroadcastMessage = {
  section: ProjectContentSection;
};

export function broadcastProjectContent(section: ProjectContentSection): void {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return;
  }

  const channel = new BroadcastChannel(PROJECT_CONTENT_BROADCAST_CHANNEL);
  channel.postMessage({ section } satisfies ProjectContentBroadcastMessage);
  channel.close();
}

export function subscribeProjectContent(
  section: ProjectContentSection,
  onUpdate: () => void,
): () => void {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return () => {};
  }

  const channel = new BroadcastChannel(PROJECT_CONTENT_BROADCAST_CHANNEL);

  channel.onmessage = (event: MessageEvent<ProjectContentBroadcastMessage>) => {
    if (event.data?.section === section) {
      onUpdate();
    }
  };

  return () => channel.close();
}

export function subscribeAllProjectContent(onUpdate: () => void): () => void {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return () => {};
  }

  const channel = new BroadcastChannel(PROJECT_CONTENT_BROADCAST_CHANNEL);
  channel.onmessage = () => onUpdate();
  return () => channel.close();
}
