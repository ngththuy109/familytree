// ==========================================================================
// Ngày giỗ — tính lần giỗ (dương lịch) sắp tới từ NGÀY MẤT ÂM LỊCH.
// Quan sát hằng năm vào đúng ngày/tháng âm. Xử lý ca biên: ngày 30 tháng thiếu
// → lùi 29 (isLeapResolved). Lõi nhận `from: Date` để test tất định.
// ==========================================================================

import type { LunarDate, Member, SolarDate } from '@/lib/domain/types';
import { getLunarMonthLength, jdFromDate, lunarToSolar, solarToLunar, VN_TZ } from '@/lib/domain/lunar';

export interface AnniversaryResult {
  lunar: LunarDate; // ngày giỗ (âm) của lần sắp tới
  solar: SolarDate; // ngày dương tương ứng
  daysUntil: number; // còn bao nhiêu ngày (>= 0)
  isLeapResolved: boolean; // đã lùi ngày 30 → 29 do tháng thiếu
}

export interface Reminder {
  member: Member;
  anniversary: AnniversaryResult;
  remind: boolean; // nằm trong cửa sổ nhắc
}

const jdOf = (s: SolarDate): number => jdFromDate(s.day, s.month, s.year);

function solarOf(from: Date): SolarDate {
  return { year: from.getFullYear(), month: from.getMonth() + 1, day: from.getDate() };
}

/** Lần giỗ dương lịch sắp tới (>= from) từ ngày mất âm lịch. */
export function nextAnniversary(
  deathLunar: LunarDate,
  from: Date,
  tz: number = VN_TZ
): AnniversaryResult {
  const fromSolar = solarOf(from);
  const fromJd = jdOf(fromSolar);
  const startYear = solarToLunar(fromSolar, tz).year;

  for (let y = startYear; y <= startYear + 2; y += 1) {
    const monthLen = getLunarMonthLength(deathLunar.month, y, false, tz);
    const day = Math.min(deathLunar.day, monthLen);
    const isLeapResolved = day !== deathLunar.day;
    const lunar: LunarDate = { year: y, month: deathLunar.month, day, isLeapMonth: false };
    const solar = lunarToSolar(lunar, tz);
    const daysUntil = jdOf(solar) - fromJd;
    if (daysUntil >= 0) return { lunar, solar, daysUntil, isLeapResolved };
  }

  // Fallback cực hiếm: dùng năm kế tiếp cùng.
  const y = startYear + 1;
  const monthLen = getLunarMonthLength(deathLunar.month, y, false, tz);
  const day = Math.min(deathLunar.day, monthLen);
  const lunar: LunarDate = { year: y, month: deathLunar.month, day, isLeapMonth: false };
  const solar = lunarToSolar(lunar, tz);
  return { lunar, solar, daysUntil: jdOf(solar) - fromJd, isLeapResolved: day !== deathLunar.day };
}

export interface UpcomingOptions {
  /** Cửa sổ nhắc (ngày). Mặc định 7. */
  days?: number;
  tz?: number;
}

/**
 * Danh sách giỗ sắp tới của những người ĐÃ MẤT có ngày mất âm lịch, sắp xếp theo
 * số ngày còn lại. `remind` = trong cửa sổ [0, days] (PRD: nhắc trước 3–7 ngày).
 */
export function upcomingAnniversaries(
  members: Member[],
  opts: UpcomingOptions,
  from: Date
): Reminder[] {
  const days = opts.days ?? 7;
  const tz = opts.tz ?? VN_TZ;
  const out: Reminder[] = [];
  for (const m of members) {
    if (m.isAlive) continue;
    const dl = m.death?.lunar;
    if (!dl) continue; // cần ngày mất âm lịch
    const anniversary = nextAnniversary(dl, from, tz);
    out.push({ member: m, anniversary, remind: anniversary.daysUntil >= 0 && anniversary.daysUntil <= days });
  }
  out.sort((a, b) => a.anniversary.daysUntil - b.anniversary.daysUntil);
  return out;
}
