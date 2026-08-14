// Tính danh xưng theo MỘT chiều: speaker gọi target là gì.
// Kết hợp graph (LCA + nội/ngoại + nhánh) với bảng danh xưng (terms).

import type { ClanSnapshot, ID, Region } from '@/lib/domain/types';
import { compareSiblings } from '@/lib/domain/ordering';
import {
  ancestorsOf,
  branchChildTowardLca,
  buildKinGraph,
  findLca,
  type KinGraph,
} from './graph';
import { inLawTerm, selectBloodTerm, type Side } from './terms';

export type Degree = 'lineal' | 'collateral' | 'spouse' | 'in-law' | 'unknown';

export interface DirectedRelation {
  term: string;
  description: string;
  side: Side;
  generationGap: number; // target ở trên speaker bao nhiêu đời (âm = dưới)
  degree: Degree;
  confidence: 'exact' | 'fallback';
}

export interface RelateContext {
  snapshot: ClanSnapshot;
  graph: KinGraph;
  region: Region;
  generations: Map<ID, number>;
}

export function makeContext(
  snapshot: ClanSnapshot,
  generations: Map<ID, number>
): RelateContext {
  return {
    snapshot,
    graph: buildKinGraph(snapshot),
    region: snapshot.clan.settings.region,
    generations,
  };
}

function spousesOf(snapshot: ClanSnapshot, id: ID): ID[] {
  const out: ID[] = [];
  for (const u of snapshot.unions) {
    if (u.partnerAId === id) out.push(u.partnerBId);
    else if (u.partnerBId === id) out.push(u.partnerAId);
  }
  return out;
}

/** Quan hệ huyết thống thuần (null nếu không có tổ tiên chung). */
function bloodRelate(ctx: RelateContext, speaker: ID, target: ID): DirectedRelation | null {
  const { graph, region } = ctx;
  const ancS = ancestorsOf(graph, speaker);
  const ancT = ancestorsOf(graph, target);
  const lca = findLca(ancS, ancT);
  if (!lca) return null;

  const dS = lca.dX;
  const dT = lca.dY;
  const L = dS - dT;
  const sideMapped: Side = lca.sideX === 'father' ? 'noi' : lca.sideX === 'mother' ? 'ngoai' : null;

  let seniorTarget: boolean | null = null;
  if (dS >= 1 && dT >= 1) {
    const cSid = branchChildTowardLca(graph, ancS, lca.lca, speaker, dS);
    const cTid = branchChildTowardLca(graph, ancT, lca.lca, target, dT);
    const cS = graph.byId.get(cSid);
    const cT = graph.byId.get(cTid);
    if (cS && cT) seniorTarget = compareSiblings(cT, cS) < 0;
  }

  const targetMember = graph.byId.get(target);
  const res = selectBloodTerm({
    L,
    dS,
    dT,
    side: sideMapped,
    targetGender: targetMember?.gender ?? 'unknown',
    seniorTarget,
    targetGeneration: ctx.generations.get(target) ?? null,
    region,
  });

  return {
    term: res.term,
    description: res.description,
    side: dS >= 2 ? sideMapped : null,
    generationGap: L,
    degree: dS === 0 || dT === 0 ? 'lineal' : 'collateral',
    confidence: res.confidence,
  };
}

/** Danh xưng speaker → target (huyết thống → vợ/chồng → thông gia → fallback). */
export function addressTerm(ctx: RelateContext, speaker: ID, target: ID): DirectedRelation {
  if (speaker === target) {
    return { term: 'chính mình', description: 'cùng một người', side: null, generationGap: 0, degree: 'unknown', confidence: 'exact' };
  }

  // Vợ/chồng trực tiếp
  if (spousesOf(ctx.snapshot, speaker).includes(target)) {
    const g = ctx.graph.byId.get(target)?.gender;
    return {
      term: g === 'male' ? 'Chồng' : g === 'female' ? 'Vợ' : 'Bạn đời',
      description: 'vợ/chồng',
      side: null,
      generationGap: 0,
      degree: 'spouse',
      confidence: 'exact',
    };
  }

  // Huyết thống
  const blood = bloodRelate(ctx, speaker, target);
  if (blood) return blood;

  // Thông gia: target là vợ/chồng của người mà speaker có quan hệ huyết thống
  for (const p of spousesOf(ctx.snapshot, target)) {
    const br = bloodRelate(ctx, speaker, p);
    if (br) {
      const g = ctx.graph.byId.get(target)?.gender ?? 'unknown';
      const mapped = inLawTerm(br.term, g);
      return {
        term: mapped.term,
        description: mapped.description,
        side: br.side,
        generationGap: br.generationGap,
        degree: 'in-law',
        confidence: 'fallback',
      };
    }
  }

  // Không xác định được quan hệ huyết thống/thông gia
  const gs = ctx.generations.get(speaker);
  const gt = ctx.generations.get(target);
  const gap = gs != null && gt != null ? gs - gt : 0;
  const genLabel = gt != null ? `đời ${gt}` : 'đời chưa rõ';
  return {
    term: `Bà con (${genLabel})`,
    description: 'chưa xác định quan hệ trực tiếp',
    side: null,
    generationGap: gap,
    degree: 'unknown',
    confidence: 'fallback',
  };
}
