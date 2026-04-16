import { useEffect, useState } from "react";

const DEVICE_STORAGE_KEY = "devwares_device_id";

interface VisitCounterState {
  totalUniqueVisitors: number | null;
  countedVisit: boolean;
  loading: boolean;
  error: string | null;
}

function getApiBase() {
  const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configuredBase) return "";
  return configuredBase.replace(/\/$/, "");
}

function getOrCreateDeviceId() {
  const existingId = window.localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existingId) return existingId;

  const nextId =
    globalThis.crypto?.randomUUID?.() ??
    `devwares-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(DEVICE_STORAGE_KEY, nextId);
  return nextId;
}

export function useUniqueVisitCounter(siteKey: string) {
  const [state, setState] = useState<VisitCounterState>({
    totalUniqueVisitors: null,
    countedVisit: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const registerVisit = async () => {
      try {
        const response = await fetch(`${getApiBase()}/api/visits`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            siteKey,
            deviceId: getOrCreateDeviceId(),
          }),
        });

        const data = (await response.json()) as {
          totalUniqueVisitors?: number;
          countedVisit?: boolean;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to sync visit counter.");
        }

        if (cancelled) return;

        setState({
          totalUniqueVisitors: data.totalUniqueVisitors ?? null,
          countedVisit: Boolean(data.countedVisit),
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;

        setState({
          totalUniqueVisitors: null,
          countedVisit: false,
          loading: false,
          error: error instanceof Error ? error.message : "Unable to sync visit counter.",
        });
      }
    };

    void registerVisit();

    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  return state;
}
