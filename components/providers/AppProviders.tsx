'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { DEMO_CLAN_ID, ensureSeeded } from '@/lib/data';
import { ClanDataProvider } from '@/lib/data/useClan';
import { AuthGate } from '@/components/auth/AuthGate';

/**
 * Khởi tạo phía client: seed dữ liệu demo (local-first), chọn dòng họ mặc định,
 * và đồng bộ chế độ người lớn tuổi ra thuộc tính [data-elderly] trên <html>.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const elderly = useAppStore((s) => s.elderlyMode);

  useEffect(() => {
    document.documentElement.dataset.elderly = elderly ? 'true' : 'false';
  }, [elderly]);

  useEffect(() => {
    let cancelled = false;
    ensureSeeded()
      .then(() => {
        if (cancelled) return;
        if (!useAppStore.getState().currentClanId) {
          useAppStore.getState().setCurrentClan(DEMO_CLAN_ID);
        }
      })
      .catch(() => {
        /* IndexedDB không khả dụng — bỏ qua, UI sẽ báo trạng thái rỗng */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGate>
      <ClanDataProvider>{children}</ClanDataProvider>
    </AuthGate>
  );
}
