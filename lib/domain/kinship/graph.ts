// Đồ thị huyết thống cho tính vai vế: cha/mẹ, tổ tiên (kèm bên nội/ngoại), LCA.
// Thuần TypeScript.

import type { ClanSnapshot, ID, Member } from '@/lib/domain/types';

export type StepSide = 'father' | 'mother' | 'self';

export interface KinGraph {
  father: Map<ID, ID>;
  mother: Map<ID, ID>;
  byId: Map<ID, Member>;
}

export interface BuildOptions {
  /** Có tính con nuôi như con ruột khi xét huyết thống không (mặc định: có). */
  includeAdopted?: boolean;
}

export function buildKinGraph(snapshot: ClanSnapshot, opts: BuildOptions = {}): KinGraph {
  const includeAdopted = opts.includeAdopted ?? true;
  const father = new Map<ID, ID>();
  const mother = new Map<ID, ID>();
  const byId = new Map(snapshot.members.map((m) => [m.id, m] as const));

  for (const p of snapshot.parentLinks) {
    if (!byId.has(p.parentId) || !byId.has(p.childId)) continue;
    if (!includeAdopted && p.kind === 'adopted') continue;
    if (p.role === 'father') father.set(p.childId, p.parentId);
    else if (p.role === 'mother') mother.set(p.childId, p.parentId);
    else {
      // role 'parent' (đồng giới / không rõ): lấp vào chỗ trống cha rồi mẹ.
      if (!father.has(p.childId)) father.set(p.childId, p.parentId);
      else if (!mother.has(p.childId)) mother.set(p.childId, p.parentId);
    }
  }
  return { father, mother, byId };
}

export interface AncestorInfo {
  dist: number; // số đời từ người gốc lên tới tổ tiên này
  side: StepSide; // bước ĐẦU TIÊN trên đường đi (qua cha → 'father' = nội)
}

/**
 * Bản đồ tổ tiên của một người (gồm chính họ ở dist 0), kèm khoảng cách nhỏ nhất
 * và "bên" (bước cha/mẹ đầu tiên) — nền cho nội/ngoại.
 */
export function ancestorsOf(graph: KinGraph, id: ID): Map<ID, AncestorInfo> {
  const res = new Map<ID, AncestorInfo>();
  res.set(id, { dist: 0, side: 'self' });
  const queue: Array<{ node: ID; dist: number; side: StepSide }> = [
    { node: id, dist: 0, side: 'self' },
  ];
  while (queue.length) {
    const cur = queue.shift();
    if (!cur) break;
    const f = graph.father.get(cur.node);
    const m = graph.mother.get(cur.node);
    const steps: Array<[ID | undefined, StepSide]> = [
      [f, 'father'],
      [m, 'mother'],
    ];
    for (const [pid, step] of steps) {
      if (!pid) continue;
      const side: StepSide = cur.dist === 0 ? step : cur.side;
      if (!res.has(pid)) {
        res.set(pid, { dist: cur.dist + 1, side });
        queue.push({ node: pid, dist: cur.dist + 1, side });
      }
    }
  }
  return res;
}

export interface LcaResult {
  lca: ID;
  dX: number; // khoảng cách từ X lên LCA
  dY: number; // khoảng cách từ Y lên LCA
  sideX: StepSide; // bên của X khi lên LCA (nội nếu qua cha)
  sideY: StepSide;
}

/** Tìm tổ tiên chung gần nhất (LCA) giữa 2 người. */
export function findLca(
  ancX: Map<ID, AncestorInfo>,
  ancY: Map<ID, AncestorInfo>
): LcaResult | null {
  let best: LcaResult | null = null;
  let bestTotal = Infinity;
  let bestMax = Infinity;
  for (const [aid, ax] of ancX) {
    const ay = ancY.get(aid);
    if (!ay) continue;
    const total = ax.dist + ay.dist;
    const mx = Math.max(ax.dist, ay.dist);
    if (total < bestTotal || (total === bestTotal && mx < bestMax)) {
      best = { lca: aid, dX: ax.dist, dY: ay.dist, sideX: ax.side, sideY: ay.side };
      bestTotal = total;
      bestMax = mx;
    }
  }
  return best;
}

/**
 * Con của LCA nằm trên đường đi tới `personId` (dùng để so trọng trưởng).
 * Nếu person là con trực tiếp của LCA → trả chính person.
 */
export function branchChildTowardLca(
  graph: KinGraph,
  anc: Map<ID, AncestorInfo>,
  lca: ID,
  personId: ID,
  dPerson: number
): ID {
  if (dPerson <= 0) return personId;
  for (const [aid, info] of anc) {
    if (info.dist === dPerson - 1 && (graph.father.get(aid) === lca || graph.mother.get(aid) === lca)) {
      return aid;
    }
  }
  return personId;
}
