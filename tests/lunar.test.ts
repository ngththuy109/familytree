import { describe, it, expect } from 'vitest';
import {
  solarToLunar,
  lunarToSolar,
  isLeapMonth,
  getLunarMonthLength,
  canChiOfYear,
  jdFromDate,
  jdToDate,
} from '@/lib/domain/lunar';
import type { LunarDate, SolarDate } from '@/lib/domain/types';

const solar = (year: number, month: number, day: number): SolarDate => ({ year, month, day });
const lun = (year: number, month: number, day: number, leap = false): LunarDate => ({
  year,
  month,
  day,
  isLeapMonth: leap,
});

describe('Âm lịch — thuật toán Hồ Ngọc Đức', () => {
  it('mùng 1 Tết (1/1 âm) → ngày Dương đã biết', () => {
    expect(lunarToSolar(lun(2024, 1, 1))).toEqual(solar(2024, 2, 10)); // Giáp Thìn
    expect(lunarToSolar(lun(2023, 1, 1))).toEqual(solar(2023, 1, 22)); // Quý Mão
    expect(lunarToSolar(lun(2020, 1, 1))).toEqual(solar(2020, 1, 25)); // Canh Tý
    expect(lunarToSolar(lun(2000, 1, 1))).toEqual(solar(2000, 2, 5)); // Canh Thìn
  });

  it('Dương → Âm cho mùng 1 Tết 2024', () => {
    expect(solarToLunar(solar(2024, 2, 10))).toEqual(lun(2024, 1, 1));
  });

  it('năm 2023 nhuận tháng 2 (chỉ tháng 2 là nhuận)', () => {
    expect(isLeapMonth(2, 2023)).toBe(true);
    expect(isLeapMonth(1, 2023)).toBe(false);
    expect(isLeapMonth(3, 2023)).toBe(false);
    expect(isLeapMonth(2, 2024)).toBe(false);
  });

  it('round-trip: solar → lunar → solar giữ nguyên (2 năm, bước 7 ngày)', () => {
    const startJd = jdFromDate(1, 1, 2022);
    for (let jd = startJd; jd < startJd + 760; jd += 7) {
      const [dd, mm, yy] = jdToDate(jd);
      const s = solar(yy, mm, dd);
      expect(lunarToSolar(solarToLunar(s))).toEqual(s);
    }
  });

  it('độ dài tháng âm luôn là 29 hoặc 30, và có cả tháng thiếu (29)', () => {
    const lengths: number[] = [];
    for (let m = 1; m <= 12; m += 1) {
      const len = getLunarMonthLength(m, 2024, false);
      expect([29, 30]).toContain(len);
      lengths.push(len);
    }
    // Trong một năm âm luôn có ít nhất một tháng 29 ngày (tháng thiếu).
    expect(lengths).toContain(29);
    expect(lengths).toContain(30);
  });

  it('Can-Chi của năm: 2024 = Giáp Thìn, 2020 = Canh Tý, 1984 = Giáp Tý', () => {
    expect(canChiOfYear(2024)).toBe('Giáp Thìn');
    expect(canChiOfYear(2020)).toBe('Canh Tý');
    expect(canChiOfYear(1984)).toBe('Giáp Tý');
  });
});
