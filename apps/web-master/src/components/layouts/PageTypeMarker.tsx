"use client";

import { useEffect } from "react";

export function PageTypeMarker({ pageType }: { pageType?: string | null }) {
  useEffect(() => {
    if (!pageType) return;
    document.body.dataset.pageType = pageType;
    return () => {
      if (document.body.dataset.pageType === pageType) {
        delete document.body.dataset.pageType;
      }
    };
  }, [pageType]);

  return null;
}
