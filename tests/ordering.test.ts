import { describe, it, expect } from 'vitest';
import {
  compareSiblings,
  orderSiblings,
  computeGenerations,
  orderedChildren,
} from '@/lib/domain/ordering';
import { demoClan } from '@/tests/fixtures/demoClan';
import type { ClanSnapshot, DualDate, Member } from '@/lib/domain/types';

const solar = (y: number, m: number, d: number): DualDate => ({
  source: 'solar',
  solar: { year: y, month: m, day: d },
  lunar: null,
  precision: 'day',
});

function makeMember(id: string, over: Partial<Member> = {}): Member {
  return {
    id,
    clanId: 'c',
    branchId: null,
    fullName: id,
    gender: 'male',
    isAlive: true,
    birth: null,
    death: null,
    restingPlace: null,
    photoUrl: null,
    biography: null,
    achievements: null,
    siblingOrder: null,
    generation: null,
    note: null,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
    ...over,
  };
}

describe('ordering — thứ tự sinh', () => {
  it('siblingOrder thắng ngày sinh (anh sinh sau nhưng con trưởng đứng trước)', () => {
    const a = makeMember('a', { siblingOrder: 1, birth: solar(1950, 1, 1) });
    const b = makeMember('b', { siblingOrder: 2, birth: solar(1940, 1, 1) });
    const sorted = orderSiblings([b, a]);
    expect(sorted.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('thiếu siblingOrder → sắp theo ngày sinh dương', () => {
    const c = makeMember('c', { birth: solar(1945, 6, 1) });
    const d = makeMember('d', { birth: solar(1940, 6, 1) });
    expect(orderSiblings([c, d]).map((m) => m.id)).toEqual(['d', 'c']);
  });

  it('compareSiblings ổn định khi bằng nhau (theo createdAt)', () => {
    const x = makeMember('x', { createdAt: '2020-01-01T00:00:00.000Z' });
    const y = makeMember('y', { createdAt: '2020-02-01T00:00:00.000Z' });
    expect(compareSiblings(x, y)).toBeLessThan(0);
  });
});

describe('ordering — đánh số đời', () => {
  it('thủy tổ = 1, con = 2, cháu = 3, chắt = 4', () => {
    const g = computeGenerations(demoClan);
    expect(g.get('m-ca')).toBe(1);
    expect(g.get('m-an')).toBe(2);
    expect(g.get('m-em')).toBe(3);
    expect(g.get('m-khoi')).toBe(4);
  });

  it('con nuôi vẫn được gán đời theo cha/mẹ nuôi', () => {
    const g = computeGenerations(demoClan);
    expect(g.get('m-dung')).toBe(2);
  });

  it('orderedChildren của thủy tổ theo thứ tự sinh: An, Bình, Hạnh, Cường, Dũng', () => {
    const kids = orderedChildren(demoClan, 'm-ca');
    expect(kids.map((m) => m.id)).toEqual(['m-an', 'm-binh', 'm-hanh', 'm-cuong', 'm-dung']);
  });

  it('không lặp vô hạn khi có chu trình cha-con', () => {
    const cyc: ClanSnapshot = {
      clan: demoClan.clan,
      members: [makeMember('A'), makeMember('B')],
      parentLinks: [
        { id: '1', clanId: 'c', parentId: 'A', childId: 'B', role: 'father', kind: 'biological', unionId: null },
        { id: '2', clanId: 'c', parentId: 'B', childId: 'A', role: 'father', kind: 'biological', unionId: null },
      ],
      unions: [],
      branches: [],
    };
    const g = computeGenerations(cyc);
    expect(g.size).toBe(2);
  });
});
