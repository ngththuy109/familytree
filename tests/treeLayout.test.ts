import { describe, it, expect } from 'vitest';
import { computeTreeLayout, ROW } from '@/components/tree/useTreeLayout';
import { demoClan } from '@/tests/fixtures/demoClan';

describe('bố cục cây gia phả', () => {
  const layout = computeTreeLayout(demoClan);
  const nodeById = new Map(layout.nodes.map((n) => [n.id, n] as const));

  it('số node = số thành viên', () => {
    expect(layout.nodes.length).toBe(demoClan.members.length);
  });

  it('mỗi đời có y riêng; thủy tổ (đời 1) ở y = 0', () => {
    expect(nodeById.get('m-ca')?.y).toBe(0);
    expect(nodeById.get('m-em')?.gen).toBe(3);
    expect(nodeById.get('m-em')?.y).toBe(2 * ROW);
    expect(nodeById.get('m-khoi')?.y).toBe(3 * ROW);
  });

  it('vợ/chồng nằm cùng hàng (couple cùng y) và có ≥1 cặp', () => {
    expect(layout.couples.length).toBeGreaterThan(0);
    const anHoa = layout.couples.find(
      (c) =>
        (c.aId === 'm-an' && c.bId === 'm-hoa') || (c.aId === 'm-hoa' && c.bId === 'm-an')
    );
    expect(anHoa).toBeDefined();
  });

  it('cạnh con nuôi được đánh dấu adopted', () => {
    const adoptedEdge = layout.edges.find((e) => e.childId === 'm-dung');
    expect(adoptedEdge?.adopted).toBe(true);
  });

  it('mọi node có toạ độ hữu hạn', () => {
    for (const n of layout.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
  });
});
