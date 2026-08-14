import { describe, it, expect } from 'vitest';
import { toJson } from '@/lib/export/toJson';
import { fromJson } from '@/lib/export/fromJson';
import { demoClanSnapshot } from '@/tests/fixtures/demoClan';

describe('export/import JSON', () => {
  it('round-trip: fromJson(toJson(snapshot)) bằng snapshot gốc', () => {
    const snap = demoClanSnapshot();
    const back = fromJson(toJson(snap));
    expect(back).toEqual(snap);
  });

  it('từ chối JSON sai phiên bản', () => {
    const bad = JSON.stringify({ version: 999, clan: {}, members: [], parentLinks: [], unions: [], branches: [] });
    expect(() => fromJson(bad)).toThrow();
  });

  it('từ chối khi thiếu trường bắt buộc', () => {
    expect(() => fromJson(JSON.stringify({ version: 1, clan: {} }))).toThrow();
  });

  it('phát hiện ParentLink trỏ tới id không tồn tại', () => {
    const bad = JSON.stringify({
      version: 1,
      clan: { id: 'c' },
      members: [{ id: 'x' }],
      parentLinks: [{ parentId: 'x', childId: 'khong-co' }],
      unions: [],
      branches: [],
    });
    expect(() => fromJson(bad)).toThrow();
  });
});
