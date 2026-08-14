'use client';

import type { ClanSnapshot, Member } from '@/lib/domain/types';
import { orderSiblings, resolveGenerations } from '@/lib/domain/ordering';
import { MemberCard } from '@/components/member/MemberCard';

/** Danh sách thành viên gom theo Đời, mỗi người một thẻ lớn. */
export function ListView({ snapshot }: { snapshot: ClanSnapshot }) {
  const gens = resolveGenerations(snapshot);
  const branchName = new Map(snapshot.branches.map((b) => [b.id, b.name] as const));

  const byGen = new Map<number, Member[]>();
  for (const m of snapshot.members) {
    const g = gens.get(m.id) ?? 0;
    const arr = byGen.get(g) ?? [];
    arr.push(m);
    byGen.set(g, arr);
  }
  const genKeys = [...byGen.keys()].sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-6">
      {genKeys.map((g) => (
        <section key={g}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Đời {g}
          </h2>
          <div className="flex flex-col gap-2">
            {orderSiblings(byGen.get(g) ?? []).map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                subtitle={m.branchId ? branchName.get(m.branchId) : undefined}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
