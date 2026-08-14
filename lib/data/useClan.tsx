'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ClanSnapshot } from '@/lib/domain/types';
import { getRepository } from '@/lib/data';
import { useAppStore } from '@/lib/store/useAppStore';

interface ClanData {
  snapshot: ClanSnapshot | null;
  loading: boolean;
  reload: () => void;
}

const ClanContext = createContext<ClanData>({ snapshot: null, loading: true, reload: () => {} });

/** Nạp snapshot của dòng họ hiện tại một lần, cung cấp cho toàn app. */
export function ClanDataProvider({ children }: { children: React.ReactNode }) {
  const clanId = useAppStore((s) => s.currentClanId);
  const [snapshot, setSnapshot] = useState<ClanSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!clanId) {
      setSnapshot(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getRepository()
      .snapshot(clanId)
      .then((s) => {
        if (!cancelled) {
          setSnapshot(s);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [clanId, tick]);

  return <ClanContext.Provider value={{ snapshot, loading, reload }}>{children}</ClanContext.Provider>;
}

export function useClan(): ClanData {
  return useContext(ClanContext);
}
