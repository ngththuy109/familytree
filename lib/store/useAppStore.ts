// State toàn cục (Zustand, persist localStorage): dòng họ hiện tại, "tôi là ai",
// chế độ xem, chế độ người lớn tuổi, vùng miền (override).

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ID, Region } from '@/lib/domain/types';

export type ViewMode = 'list' | 'tree';

interface AppState {
  currentClanId: ID | null;
  selfMemberId: ID | null; // để tính vai vế "bạn gọi là gì"
  viewMode: ViewMode;
  elderlyMode: boolean;
  regionOverride: Region | null; // null = dùng region của dòng họ
  setCurrentClan: (id: ID | null) => void;
  setSelf: (id: ID | null) => void;
  setViewMode: (v: ViewMode) => void;
  toggleElderly: () => void;
  setElderly: (v: boolean) => void;
  setRegionOverride: (r: Region | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentClanId: null,
      selfMemberId: null,
      viewMode: 'list',
      elderlyMode: false,
      regionOverride: null,
      setCurrentClan: (id) => set({ currentClanId: id }),
      setSelf: (id) => set({ selfMemberId: id }),
      setViewMode: (v) => set({ viewMode: v }),
      toggleElderly: () => set((s) => ({ elderlyMode: !s.elderlyMode })),
      setElderly: (v) => set({ elderlyMode: v }),
      setRegionOverride: (r) => set({ regionOverride: r }),
    }),
    { name: 'giapha-prefs' }
  )
);
