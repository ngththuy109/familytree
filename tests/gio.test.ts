import { describe, it, expect } from 'vitest';
import { nextAnniversary, upcomingAnniversaries } from '@/lib/domain/gio/anniversary';
import { getLunarMonthLength, lunarToSolar } from '@/lib/domain/lunar';
import type { DualDate, LunarDate, Member } from '@/lib/domain/types';

const lun = (year: number, month: number, day: number): LunarDate => ({
  year,
  month,
  day,
  isLeapMonth: false,
});

function deceased(id: string, deathLunar: LunarDate | null): Member {
  const death: DualDate | null = deathLunar
    ? { source: 'lunar', solar: null, lunar: deathLunar, precision: 'day' }
    : null;
  return {
    id,
    clanId: 'c',
    branchId: null,
    fullName: id,
    gender: 'male',
    isAlive: deathLunar === null,
    birth: null,
    death,
    restingPlace: null,
    photoUrl: null,
    biography: null,
    achievements: null,
    siblingOrder: null,
    generation: null,
    note: null,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
  };
}

describe('ngày giỗ — nextAnniversary', () => {
  it('trả ngày dương nhất quán với ngày âm và daysUntil >= 0', () => {
    const ann = nextAnniversary(lun(2015, 11, 5), new Date(2026, 0, 1));
    expect(ann.daysUntil).toBeGreaterThanOrEqual(0);
    expect(ann.lunar.month).toBe(11);
    expect(ann.lunar.day).toBe(5);
    expect(ann.solar).toEqual(lunarToSolar(ann.lunar));
  });

  it('nếu giỗ năm nay đã qua → trả năm sau (daysUntil lớn)', () => {
    // Giỗ mùng 1 Tết; from = ngay sau Tết 2024 (11/02/2024) → lần tới là Tết 2025.
    const ann = nextAnniversary(lun(2000, 1, 1), new Date(2024, 1, 11));
    expect(ann.daysUntil).toBeGreaterThan(300);
    expect(ann.daysUntil).toBeLessThan(400);
    expect(ann.solar.year).toBe(2025);
  });

  it('ngày mất 30 tháng thiếu → lùi 29, isLeapResolved=true', () => {
    let target29: number | null = null;
    for (let y = 2024; y <= 2040; y += 1) {
      if (getLunarMonthLength(7, y, false) === 29) {
        target29 = y;
        break;
      }
    }
    expect(target29).not.toBeNull();
    const gio = lunarToSolar({ year: target29 as number, month: 7, day: 29, isLeapMonth: false });
    const from = new Date(gio.year, 0, 1);
    const ann = nextAnniversary(lun(2000, 7, 30), from);
    expect(ann.lunar.year).toBe(target29);
    expect(ann.lunar.day).toBe(29);
    expect(ann.isLeapResolved).toBe(true);
  });
});

describe('ngày giỗ — upcomingAnniversaries', () => {
  it('cửa sổ nhắc: daysUntil=5 → remind=true; =10 → remind=false', () => {
    const death = lun(2000, 3, 10);
    const occ = lunarToSolar({ year: 2026, month: 3, day: 10, isLeapMonth: false });

    const from5 = new Date(occ.year, occ.month - 1, occ.day);
    from5.setDate(from5.getDate() - 5);
    const r5 = upcomingAnniversaries([deceased('a', death)], { days: 7 }, from5);
    expect(r5[0]?.anniversary.daysUntil).toBe(5);
    expect(r5[0]?.remind).toBe(true);

    const from10 = new Date(occ.year, occ.month - 1, occ.day);
    from10.setDate(from10.getDate() - 10);
    const r10 = upcomingAnniversaries([deceased('a', death)], { days: 7 }, from10);
    expect(r10[0]?.anniversary.daysUntil).toBe(10);
    expect(r10[0]?.remind).toBe(false);
  });

  it('bỏ người còn sống và người thiếu ngày mất âm; sắp xếp tăng theo daysUntil', () => {
    const from = new Date(2026, 0, 1);
    const list = upcomingAnniversaries(
      [deceased('alive', null), deceased('x', lun(2010, 6, 20)), deceased('y', lun(2012, 2, 3))],
      { days: 7 },
      from
    );
    expect(list.map((r) => r.member.id).sort()).toEqual(['x', 'y']);
    for (let i = 1; i < list.length; i += 1) {
      expect(list[i]!.anniversary.daysUntil).toBeGreaterThanOrEqual(list[i - 1]!.anniversary.daysUntil);
    }
  });
});
