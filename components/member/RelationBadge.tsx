'use client';

import type { ClanSnapshot } from '@/lib/domain/types';
import { relate } from '@/lib/domain/kinship';
import { useAppStore } from '@/lib/store/useAppStore';
import { applyRegionOverride } from '@/lib/data/region';

/** "Bạn gọi X là …" — vai vế của thành viên so với "tôi" đã chọn ở Cài đặt. */
export function RelationBadge({ memberId, snapshot }: { memberId: string; snapshot: ClanSnapshot }) {
  const selfId = useAppStore((s) => s.selfMemberId);
  const regionOverride = useAppStore((s) => s.regionOverride);

  if (!selfId) {
    return <p className="text-sm text-muted">Chọn “tôi là ai” ở Cài đặt để xem vai vế.</p>;
  }
  if (selfId === memberId) {
    return <p className="text-sm text-muted">Đây là bạn.</p>;
  }
  const snap = applyRegionOverride(snapshot, regionOverride);
  const rel = relate(snap, selfId, memberId);
  return (
    <div className="rounded-xl bg-primary/10 p-3">
      <span className="text-sm text-muted">Bạn gọi: </span>
      <span className="text-lg font-semibold text-primary">{rel.term}</span>
      {rel.confidence === 'fallback' && <span className="text-sm text-muted"> (ước lượng)</span>}
      {rel.description && <span className="block text-sm text-muted">{rel.description}</span>}
    </div>
  );
}
