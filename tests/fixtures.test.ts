import { describe, it, expect } from 'vitest';
import { demoClan } from '@/tests/fixtures/demoClan';

describe('fixture demoClan hợp lệ', () => {
  it('có ≥1 con nuôi (kind="adopted")', () => {
    const adopted = demoClan.parentLinks.filter((p) => p.kind === 'adopted');
    expect(adopted.length).toBeGreaterThanOrEqual(1);
  });

  it('có ≥1 người có 2 Union (nhiều đời vợ)', () => {
    const count = new Map<string, number>();
    for (const u of demoClan.unions) {
      count.set(u.partnerAId, (count.get(u.partnerAId) ?? 0) + 1);
      count.set(u.partnerBId, (count.get(u.partnerBId) ?? 0) + 1);
    }
    const multi = [...count.values()].filter((n) => n >= 2);
    expect(multi.length).toBeGreaterThanOrEqual(1);
  });

  it('mọi ParentLink trỏ tới member tồn tại', () => {
    const ids = new Set(demoClan.members.map((m) => m.id));
    for (const p of demoClan.parentLinks) {
      expect(ids.has(p.parentId), `parent ${p.parentId}`).toBe(true);
      expect(ids.has(p.childId), `child ${p.childId}`).toBe(true);
    }
  });

  it('mọi Union trỏ tới member tồn tại', () => {
    const ids = new Set(demoClan.members.map((m) => m.id));
    for (const u of demoClan.unions) {
      expect(ids.has(u.partnerAId) && ids.has(u.partnerBId)).toBe(true);
    }
  });

  it('không có chu trình cha-con', () => {
    const childrenOf = new Map<string, string[]>();
    for (const p of demoClan.parentLinks) {
      const arr = childrenOf.get(p.parentId) ?? [];
      arr.push(p.childId);
      childrenOf.set(p.parentId, arr);
    }
    const state = new Map<string, number>(); // 0=visiting,1=done
    const hasCycle = (node: string): boolean => {
      const s = state.get(node);
      if (s === 0) return true;
      if (s === 1) return false;
      state.set(node, 0);
      for (const c of childrenOf.get(node) ?? []) {
        if (hasCycle(c)) return true;
      }
      state.set(node, 1);
      return false;
    };
    const cyclic = demoClan.members.some((m) => hasCycle(m.id));
    expect(cyclic).toBe(false);
  });

  it('founderMemberId tồn tại và là đời 1', () => {
    const founder = demoClan.members.find((m) => m.id === demoClan.clan.founderMemberId);
    expect(founder).toBeDefined();
    expect(founder?.generation).toBe(1);
  });
});
