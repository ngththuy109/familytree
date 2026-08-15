import type { DualDate, LunarDate, SolarDate } from '@/lib/domain/types';
import { canChiOfYear, lunarToSolar, solarToLunar } from '@/lib/domain/lunar';

function fmtSolar(s: SolarDate): string {
  return `${s.day}/${s.month}/${s.year}`;
}
function fmtLunar(l: LunarDate): string {
  return `${l.day}/${l.month}${l.isLeapMonth ? ' (nhuận)' : ''} ÂL · ${canChiOfYear(l.year)}`;
}

/** Hiển thị một ngày kép: Dương lịch + Âm lịch (tự suy bên còn thiếu). */
export function LunarSolarLabel({ date }: { date: DualDate | null }) {
  if (!date) return <span className="text-muted">—</span>;
  const solar = date.solar ?? (date.lunar ? lunarToSolar(date.lunar) : null);
  const lunar = date.lunar ?? (date.solar ? solarToLunar(date.solar) : null);
  return (
    <span>
      {solar && <span>{fmtSolar(solar)}</span>}
      {lunar && <span className="text-muted"> · {fmtLunar(lunar)}</span>}
    </span>
  );
}
