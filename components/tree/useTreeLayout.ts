// Bố cục cây gia phả (thuần TS, testable). Trục theo huyết thống: con treo dưới
// cha/mẹ HUYẾT THỐNG; vợ/chồng (dâu/rể) gắn cạnh; con sắp theo thứ tự sinh.

import type { ClanSnapshot, ID, Member } from '@/lib/domain/types';
import { orderSiblings } from '@/lib/domain/ordering';

export const NODE_W = 112;
export const NODE_H = 54;
export const SPOUSE_GAP = 12;
export const COUPLE_GAP = 48;
export const ROW = 132;

export interface TreeNodePos {
  id: ID;
  member: Member;
  x: number; // tâm node
  y: number; // đỉnh node
  gen: number;
}
export interface CoupleLink {
  aId: ID;
  bId: ID;
  ax: number;
  bx: number;
  y: number;
}
export interface TreeEdge {
  parentId: ID;
  childId: ID;
  adopted: boolean;
  parentX: number;
  parentY: number;
  childX: number;
  childY: number;
}
export interface TreeLayout {
  nodes: TreeNodePos[];
  couples: CoupleLink[];
  edges: TreeEdge[];
  width: number;
  height: number;
}

export function computeTreeLayout(snapshot: ClanSnapshot): TreeLayout {
  const byId = new Map(snapshot.members.map((m) => [m.id, m] as const));
  const father = new Map<ID, ID>();
  const mother = new Map<ID, ID>();
  const childrenAll = new Map<ID, ID[]>();
  const adopted = new Map<string, boolean>();

  for (const p of snapshot.parentLinks) {
    if (!byId.has(p.parentId) || !byId.has(p.childId)) continue;
    if (p.role === 'mother') mother.set(p.childId, p.parentId);
    else father.set(p.childId, p.parentId);
    const arr = childrenAll.get(p.parentId) ?? [];
    if (!arr.includes(p.childId)) arr.push(p.childId);
    childrenAll.set(p.parentId, arr);
    adopted.set(`${p.parentId}->${p.childId}`, p.kind === 'adopted');
  }

  const descendantsOf = (id: ID): Set<ID> => {
    const seen = new Set<ID>();
    const stack = [id];
    while (stack.length) {
      const x = stack.pop() as ID;
      if (seen.has(x)) continue;
      seen.add(x);
      for (const c of childrenAll.get(x) ?? []) stack.push(c);
    }
    return seen;
  };

  const hasParentInClan = (id: ID): boolean => {
    const f = father.get(id);
    const m = mother.get(id);
    return Boolean((f && byId.has(f)) || (m && byId.has(m)));
  };

  // Chọn thủy tổ: founderMemberId, hoặc gốc có nhiều hậu duệ nhất.
  let founderId: ID | null = snapshot.clan.founderMemberId ?? null;
  if (!founderId || !byId.has(founderId)) {
    let best = -1;
    for (const m of snapshot.members) {
      if (hasParentInClan(m.id)) continue;
      const count = descendantsOf(m.id).size;
      if (count > best) {
        best = count;
        founderId = m.id;
      }
    }
  }

  const bloodSet = founderId ? descendantsOf(founderId) : new Set<ID>();

  const bloodParent = (child: ID): ID | null => {
    const f = father.get(child);
    const m = mother.get(child);
    if (f && bloodSet.has(f)) return f;
    if (m && bloodSet.has(m)) return m;
    return f ?? m ?? null;
  };
  const spineChildren = (id: ID): Member[] =>
    orderSiblings(
      (childrenAll.get(id) ?? [])
        .filter((c) => bloodParent(c) === id)
        .map((c) => byId.get(c))
        .filter((m): m is Member => Boolean(m))
    );
  const spousesOf = (id: ID): ID[] => {
    const out: ID[] = [];
    for (const u of snapshot.unions) {
      if (u.partnerAId === id) out.push(u.partnerBId);
      else if (u.partnerBId === id) out.push(u.partnerAId);
    }
    return out;
  };

  const placed = new Set<ID>();
  const nodeX = new Map<ID, number>();
  const unionCenter = new Map<ID, number>();
  const genOf = new Map<ID, number>();
  const couples: CoupleLink[] = [];
  let cursor = 0;

  const layout = (id: ID, gen: number): number => {
    placed.add(id);
    genOf.set(id, gen);
    const spouses = spousesOf(id).filter((s) => !placed.has(s) && !bloodSet.has(s) && byId.has(s));
    const coupleWidth = NODE_W * (1 + spouses.length) + SPOUSE_GAP * spouses.length;
    const kids = spineChildren(id);
    let center: number;
    if (kids.length) {
      const centers = kids.map((k) => layout(k.id, gen + 1));
      center = (centers[0]! + centers[centers.length - 1]!) / 2;
    } else {
      center = cursor + coupleWidth / 2;
      cursor += coupleWidth + COUPLE_GAP;
    }
    const startX = center - coupleWidth / 2;
    const selfCenter = startX + NODE_W / 2;
    nodeX.set(id, selfCenter);
    spouses.forEach((s, i) => {
      placed.add(s);
      genOf.set(s, gen);
      const sx = startX + NODE_W / 2 + (i + 1) * (NODE_W + SPOUSE_GAP);
      nodeX.set(s, sx);
      couples.push({ aId: id, bId: s, ax: selfCenter, bx: sx, y: (gen - 1) * ROW + NODE_H / 2 });
    });
    unionCenter.set(id, center);
    return center;
  };

  if (founderId) layout(founderId, 1);

  // Người chưa đặt (rời rạc / in-law không có bạn đời đã đặt) → xếp cuối, đời 1.
  for (const m of snapshot.members) {
    if (placed.has(m.id)) continue;
    placed.add(m.id);
    genOf.set(m.id, 1);
    nodeX.set(m.id, cursor + NODE_W / 2);
    unionCenter.set(m.id, cursor + NODE_W / 2);
    cursor += NODE_W + COUPLE_GAP;
  }

  const nodes: TreeNodePos[] = snapshot.members.map((m) => {
    const gen = genOf.get(m.id) ?? 1;
    return { id: m.id, member: m, x: nodeX.get(m.id) ?? 0, y: (gen - 1) * ROW, gen };
  });

  const edges: TreeEdge[] = [];
  for (const m of snapshot.members) {
    const pGen = genOf.get(m.id) ?? 1;
    for (const c of spineChildren(m.id)) {
      edges.push({
        parentId: m.id,
        childId: c.id,
        adopted: adopted.get(`${m.id}->${c.id}`) ?? false,
        parentX: unionCenter.get(m.id) ?? nodeX.get(m.id) ?? 0,
        parentY: (pGen - 1) * ROW + NODE_H,
        childX: nodeX.get(c.id) ?? 0,
        childY: ((genOf.get(c.id) ?? 1) - 1) * ROW,
      });
    }
  }

  const width = Math.max(cursor, ...nodes.map((n) => n.x + NODE_W)) + NODE_W;
  const maxGen = Math.max(1, ...nodes.map((n) => n.gen));
  return { nodes, couples, edges, width, height: maxGen * ROW };
}
