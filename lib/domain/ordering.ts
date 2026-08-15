// ==========================================================================
// Thứ tự sinh (con trưởng/thứ) & đánh số đời.
// Ưu tiên sắp anh em: siblingOrder → ngày sinh (dương) → createdAt.
// Đời = tính từ thủy tổ (max đời của cha/mẹ + 1); in-law (không cha mẹ) = 1,
// có thể "mượn" đời của vợ/chồng khi hiển thị (resolveGenerations).
// Thuần TypeScript — không React/DOM.
// ==========================================================================

import type { ClanSnapshot, ID, Member, SolarDate } from '@/lib/domain/types';
import { lunarToSolar } from '@/lib/domain/lunar';

/** Ngày sinh quy về Dương lịch (suy từ âm nếu cần). */
export function birthSolar(m: Member): SolarDate | null {
  if (!m.birth) return null;
  if (m.birth.solar) return m.birth.solar;
  if (m.birth.lunar) return lunarToSolar(m.birth.lunar);
  return null;
}

function compareSolar(a: SolarDate, b: SolarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

/**
 * So sánh 2 anh em để sắp con trưởng/thứ.
 * Nếu cả hai có siblingOrder → dùng nó (thắng ngày sinh). Ngược lại theo ngày
 * sinh dương, cuối cùng theo createdAt (ổn định).
 */
export function compareSiblings(a: Member, b: Member): number {
  if (a.siblingOrder != null && b.siblingOrder != null) {
    if (a.siblingOrder !== b.siblingOrder) return a.siblingOrder - b.siblingOrder;
  }
  const da = birthSolar(a);
  const db = birthSolar(b);
  if (da && db) {
    const c = compareSolar(da, db);
    if (c !== 0) return c;
  } else if (da && !db) {
    return -1;
  } else if (!da && db) {
    return 1;
  }
  return a.createdAt.localeCompare(b.createdAt);
}

/** Sắp một danh sách anh em (trả bản sao đã sắp). */
export function orderSiblings(list: Member[]): Member[] {
  return [...list].sort(compareSiblings);
}

interface Graph {
  memberIds: Set<ID>;
  parentsOf: Map<ID, ID[]>; // child → parents (chỉ trong họ)
  childrenOf: Map<ID, ID[]>; // parent → children
}

function buildGraph(snapshot: ClanSnapshot): Graph {
  const memberIds = new Set(snapshot.members.map((m) => m.id));
  const parentsOf = new Map<ID, ID[]>();
  const childrenOf = new Map<ID, ID[]>();
  for (const p of snapshot.parentLinks) {
    if (!memberIds.has(p.parentId) || !memberIds.has(p.childId)) continue;
    (parentsOf.get(p.childId) ?? parentsOf.set(p.childId, []).get(p.childId)!).push(p.parentId);
    (childrenOf.get(p.parentId) ?? childrenOf.set(p.parentId, []).get(p.parentId)!).push(p.childId);
  }
  return { memberIds, parentsOf, childrenOf };
}

/**
 * Đánh số đời (huyết thống): con = max(đời cha, đời mẹ) + 1; gốc (không cha mẹ
 * trong họ) = 1. Chống chu trình. Trả Map<memberId, đời>.
 */
export function computeGenerations(snapshot: ClanSnapshot): Map<ID, number> {
  const { parentsOf } = buildGraph(snapshot);
  const gen = new Map<ID, number>();
  const computing = new Set<ID>();

  const genOf = (id: ID): number => {
    const cached = gen.get(id);
    if (cached != null) return cached;
    if (computing.has(id)) return 1; // chống chu trình
    computing.add(id);
    const parents = parentsOf.get(id) ?? [];
    const g = parents.length === 0 ? 1 : Math.max(...parents.map(genOf)) + 1;
    computing.delete(id);
    gen.set(id, g);
    return g;
  };

  for (const m of snapshot.members) genOf(m.id);
  return gen;
}

/**
 * Như computeGenerations nhưng in-law (không có cha mẹ trong họ) sẽ "mượn" đời
 * của vợ/chồng để hiển thị đúng hàng. Dùng cho UI (danh sách/cây).
 */
export function resolveGenerations(snapshot: ClanSnapshot): Map<ID, number> {
  const gen = computeGenerations(snapshot);
  const { memberIds, parentsOf } = buildGraph(snapshot);
  const hasParents = (id: ID): boolean => (parentsOf.get(id)?.length ?? 0) > 0;

  let changed = true;
  let guard = 0;
  while (changed && guard < 20) {
    changed = false;
    guard += 1;
    for (const u of snapshot.unions) {
      if (!memberIds.has(u.partnerAId) || !memberIds.has(u.partnerBId)) continue;
      const pairs: Array<[ID, ID]> = [
        [u.partnerAId, u.partnerBId],
        [u.partnerBId, u.partnerAId],
      ];
      for (const [self, other] of pairs) {
        // self là in-law (không cha mẹ trong họ) → mượn đời của other có huyết thống.
        if (!hasParents(self) && hasParents(other)) {
          const go = gen.get(other);
          if (go != null && gen.get(self) !== go) {
            gen.set(self, go);
            changed = true;
          }
        }
      }
    }
  }
  return gen;
}

/** Danh sách con của một người, đã sắp theo thứ tự sinh. */
export function orderedChildren(snapshot: ClanSnapshot, parentId: ID): Member[] {
  const byId = new Map(snapshot.members.map((m) => [m.id, m] as const));
  const childIds = [
    ...new Set(
      snapshot.parentLinks.filter((p) => p.parentId === parentId).map((p) => p.childId)
    ),
  ];
  const kids = childIds
    .map((id) => byId.get(id))
    .filter((m): m is Member => m !== undefined);
  return orderSiblings(kids);
}
