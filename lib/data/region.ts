import type { ClanSnapshot, Region } from '@/lib/domain/types';

/** Trả snapshot với region ghi đè (nếu có) — dùng cho tính vai vế theo lựa chọn người dùng. */
export function applyRegionOverride(
  snapshot: ClanSnapshot,
  regionOverride: Region | null
): ClanSnapshot {
  if (!regionOverride) return snapshot;
  return {
    ...snapshot,
    clan: {
      ...snapshot.clan,
      settings: { ...snapshot.clan.settings, region: regionOverride },
    },
  };
}
