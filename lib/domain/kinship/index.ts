// API công khai cho vai vế/xưng hô.
//   relate(snapshot, x, y) → { term (x gọi y), reciprocal (y gọi x), ... }

import type { ClanSnapshot, ID } from '@/lib/domain/types';
import { resolveGenerations } from '@/lib/domain/ordering';
import { addressTerm, makeContext, type Degree, type RelateContext } from './relate';
import type { Side } from './terms';

export interface Relationship {
  /** X gọi Y bằng gì. */
  term: string;
  /** Y gọi X bằng gì (chiều ngược lại). */
  reciprocal: string;
  description: string;
  side: Side;
  /** Y ở trên X bao nhiêu đời (âm = dưới). */
  generationGap: number;
  degree: Degree;
  confidence: 'exact' | 'fallback';
}

/** Tạo context (nạp graph + đời) một lần để tính nhiều cặp. */
export function createRelateContext(snapshot: ClanSnapshot): RelateContext {
  return makeContext(snapshot, resolveGenerations(snapshot));
}

export function relateWith(ctx: RelateContext, xId: ID, yId: ID): Relationship {
  const forward = addressTerm(ctx, xId, yId); // x gọi y
  const backward = addressTerm(ctx, yId, xId); // y gọi x
  return {
    term: forward.term,
    reciprocal: backward.term,
    description: forward.description,
    side: forward.side,
    generationGap: forward.generationGap,
    degree: forward.degree,
    confidence:
      forward.confidence === 'exact' && backward.confidence === 'exact' ? 'exact' : 'fallback',
  };
}

/** Quan hệ giữa 2 người trong dòng họ. */
export function relate(snapshot: ClanSnapshot, xId: ID, yId: ID): Relationship {
  return relateWith(createRelateContext(snapshot), xId, yId);
}

export { addressTerm, makeContext } from './relate';
export type { Degree, DirectedRelation, RelateContext } from './relate';
export { buildKinGraph, ancestorsOf, findLca } from './graph';
export type { Side } from './terms';
