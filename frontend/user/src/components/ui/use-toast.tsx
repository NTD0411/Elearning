"use client";

import React from "react";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: string;
};

export function useToast() {
  const toast = (opts: ToastOptions) => {
    // Minimal placeholder: log and fallback to alert for visibility during development.
    // In a real app you'd integrate a toast library or a context-based UI.
    // Keep this synchronous and simple so callers can use it in components.
    // eslint-disable-next-line no-console
    console.log("toast", opts);
    if (typeof window !== "undefined" && opts?.title) {
      // Non-blocking visual fallback
      void Promise.resolve().then(() => {
        // Use setTimeout to avoid blocking render
        setTimeout(() => {
          // Only show simple alerts for destructive/error variants to avoid spam
          if (opts.variant === "destructive") {
            // eslint-disable-next-line no-alert
            alert(`${opts.title}\n${opts.description ?? ""}`);
          }
        }, 0);
      });
    }
  };

  return { toast } as const;
}

export default useToast;
