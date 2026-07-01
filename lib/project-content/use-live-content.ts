"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProjectContentSection } from "@/lib/types/project-content";
import { subscribeProjectContent } from "@/lib/project-content/broadcast";

export function useLiveProjectContent<T>(
  section: ProjectContentSection,
  initialData: T,
): T {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/project-content/${section}`);
    const json = await response.json();
    if (json.success) {
      setData(json.data as T);
    }
  }, [section]);

  useEffect(() => {
    return subscribeProjectContent(section, () => {
      void refresh();
    });
  }, [section, refresh]);

  return data;
}
