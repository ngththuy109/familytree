// API tiện dụng cho Âm lịch — bọc quanh thuật toán Hồ Ngọc Đức.
// Kiểu vào/ra dùng SolarDate/LunarDate của domain. Múi giờ mặc định VN = 7.

import type { LunarDate, SolarDate } from '@/lib/domain/types';
import {
  convertLunar2Solar,
  convertSolar2Lunar,
  isLeapMonthHND,
  jdFromDate,
  lunarMonthLengthFromJd,
} from './hongocduc';

export { jdFromDate, jdToDate } from './hongocduc';
export * from './canchi';

/** Múi giờ Việt Nam (UTC+7). */
export const VN_TZ = 7;

/** Dương → Âm. */
export function solarToLunar(s: SolarDate, tz: number = VN_TZ): LunarDate {
  const [day, month, year, leap] = convertSolar2Lunar(s.day, s.month, s.year, tz);
  return { day, month, year, isLeapMonth: leap === 1 };
}

/** Âm → Dương (tôn trọng cờ tháng nhuận). Trả {0,0,0} nếu nhuận không hợp lệ. */
export function lunarToSolar(l: LunarDate, tz: number = VN_TZ): SolarDate {
  const [day, month, year] = convertLunar2Solar(
    l.day,
    l.month,
    l.year,
    l.isLeapMonth ? 1 : 0,
    tz
  );
  return { day, month, year };
}

/** Tháng `month` của năm âm `year` có phải tháng nhuận không? */
export function isLeapMonth(month: number, year: number, tz: number = VN_TZ): boolean {
  return isLeapMonthHND(month, year, tz);
}

/** Số ngày của một tháng âm: 29 (thiếu) hoặc 30 (đủ). */
export function getLunarMonthLength(
  month: number,
  year: number,
  isLeap: boolean,
  tz: number = VN_TZ
): 29 | 30 {
  const [day, m, y] = convertLunar2Solar(1, month, year, isLeap ? 1 : 0, tz);
  if (day === 0) return 30; // fallback an toàn
  return lunarMonthLengthFromJd(jdFromDate(day, m, y), tz);
}

/** Julian day number của một ngày Âm lịch. */
export function jdFromLunar(l: LunarDate, tz: number = VN_TZ): number {
  const s = lunarToSolar(l, tz);
  return jdFromDate(s.day, s.month, s.year);
}
