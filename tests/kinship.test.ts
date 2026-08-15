import { describe, it, expect } from 'vitest';
import { relate } from '@/lib/domain/kinship';
import { demoClan } from '@/tests/fixtures/demoClan';
import type { ClanSnapshot, Region } from '@/lib/domain/types';

// relate(snapshot, x, y): term = X gọi Y; reciprocal = Y gọi X.
const r = (x: string, y: string, snap: ClanSnapshot = demoClan) => relate(snap, x, y);

function withRegion(region: Region): ClanSnapshot {
  return { ...demoClan, clan: { ...demoClan.clan, settings: { ...demoClan.clan.settings, region } } };
}

describe('vai vế — trực hệ (miền Trung)', () => {
  it('con gọi cha "Ba", cha gọi con "Con"', () => {
    const rel = r('m-em', 'm-an'); // Em là con của An
    expect(rel.term).toBe('Ba');
    expect(rel.reciprocal).toBe('Con');
  });

  it('cháu gọi ông nội "Ông nội", ông gọi lại "Cháu"', () => {
    const rel = r('m-em', 'm-ca'); // Cả là ông nội của Em
    expect(rel.term).toBe('Ông nội');
    expect(rel.reciprocal).toBe('Cháu');
    expect(rel.side).toBe('noi');
  });

  it('chắt gọi cụ cố (đời +3) là "Cố" theo miền Trung', () => {
    const rel = r('m-khoi', 'm-ca'); // Khôi (đời 4) với thủy tổ Cả (đời 1)
    expect(rel.term).toBe('Cố');
  });
});

describe('vai vế — bàng hệ nội/ngoại (miền Trung)', () => {
  it('anh trai của cha (con trưởng) → "Bác"', () => {
    // Lan (con Cường) gọi An (anh của Cường) — An là con trưởng
    expect(r('m-lan', 'm-an').term).toBe('Bác');
  });

  it('em trai của cha (con thứ) → "Chú"', () => {
    // Em (con An) gọi Cường (em của An)
    expect(r('m-em', 'm-cuong').term).toBe('Chú');
  });

  it('chị/em gái của cha → "O" (miền Trung)', () => {
    // Em (con An) gọi Bình (chị của An)
    expect(r('m-em', 'm-binh').term).toBe('O');
  });

  it('anh/em trai của mẹ → "Cậu"', () => {
    // Hà (con bà Bình) gọi An (anh của Bình) qua nhánh ngoại
    const rel = r('m-ha', 'm-an');
    expect(rel.term).toBe('Cậu');
    expect(rel.side).toBe('ngoai');
  });

  it('chị/em gái của mẹ → "Dì"', () => {
    // Hà (con bà Bình) gọi Hạnh (em gái của Bình)
    expect(r('m-ha', 'm-hanh').term).toBe('Dì');
  });

  it('anh/chị/em họ cùng đời có hậu tố "họ", đúng trọng trưởng', () => {
    // Em (nhánh An, con trưởng) và Lan (nhánh Cường) — Em vai anh họ
    const rel = r('m-lan', 'm-em'); // Lan gọi Em
    expect(rel.term).toBe('Anh họ');
    expect(r('m-em', 'm-lan').term).toBe('Em họ');
  });

  it('anh/chị/em ruột: Giang gọi Em là "Anh", Em gọi Giang "Em"', () => {
    const rel = r('m-giang', 'm-em');
    expect(rel.term).toBe('Anh');
    expect(rel.reciprocal).toBe('Em');
  });
});

describe('vai vế — vùng miền & fallback', () => {
  it('cùng quan hệ nhưng miền Bắc → "Cô" thay vì "O"', () => {
    const bac = withRegion('bac');
    expect(r('m-em', 'm-binh', bac).term).toBe('Cô');
  });

  it('vợ/chồng trực tiếp → "Vợ"/"Chồng"', () => {
    expect(r('m-an', 'm-hoa').term).toBe('Vợ'); // An gọi Hoa
    expect(r('m-hoa', 'm-an').term).toBe('Chồng');
  });

  it('thông gia: gọi vợ của chú/bác hợp lý (confidence fallback)', () => {
    // Em gọi Kim (vợ của Cường = chú của Em) → "Thím"
    const rel = r('m-em', 'm-kim');
    expect(rel.term).toBe('Thím');
    expect(rel.confidence).toBe('fallback');
  });

  it('reciprocal luôn có giá trị dùng được', () => {
    const rel = r('m-em', 'm-an');
    expect(rel.reciprocal.length).toBeGreaterThan(0);
  });
});
