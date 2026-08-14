'use client';

import { useState } from 'react';
import type { DualDate } from '@/lib/domain/types';
import { lunarToSolar, solarToLunar, canChiOfYear } from '@/lib/domain/lunar';

function buildDual(
  mode: 'solar' | 'lunar',
  day: number,
  month: number,
  year: number,
  leap: boolean
): DualDate | null {
  if (!day || !month || !year) return null;
  if (mode === 'solar') {
    const solar = { year, month, day };
    return { source: 'solar', solar, lunar: solarToLunar(solar), precision: 'day' };
  }
  const lunar = { year, month, day, isLeapMonth: leap };
  return { source: 'lunar', solar: lunarToSolar(lunar), lunar, precision: 'day' };
}

const toNum = (s: string): number => (s ? parseInt(s, 10) || 0 : 0);

export function DualDateInput({
  value,
  onChange,
  label,
}: {
  value: DualDate | null;
  onChange: (d: DualDate | null) => void;
  label?: string;
}) {
  const initMode: 'solar' | 'lunar' = value?.source ?? 'solar';
  const initSide = initMode === 'lunar' ? value?.lunar : value?.solar;
  const [mode, setMode] = useState<'solar' | 'lunar'>(initMode);
  const [day, setDay] = useState(initSide ? String(initSide.day) : '');
  const [month, setMonth] = useState(initSide ? String(initSide.month) : '');
  const [year, setYear] = useState(initSide ? String(initSide.year) : '');
  const [leap, setLeap] = useState(
    value?.source === 'lunar' ? Boolean(value.lunar?.isLeapMonth) : false
  );

  const preview = buildDual(mode, toNum(day), toNum(month), toNum(year), leap);
  const other = mode === 'solar' ? preview?.lunar : preview?.solar;

  const emit = (d: string, m: string, y: string, lp: boolean, md: 'solar' | 'lunar') => {
    onChange(buildDual(md, toNum(d), toNum(m), toNum(y), lp));
  };

  const switchMode = (nm: 'solar' | 'lunar') => {
    const side = nm === 'lunar' ? preview?.lunar : preview?.solar;
    if (side) {
      setDay(String(side.day));
      setMonth(String(side.month));
      setYear(String(side.year));
      const lp = nm === 'lunar' ? Boolean(preview?.lunar?.isLeapMonth) : false;
      setLeap(lp);
      setMode(nm);
      emit(String(side.day), String(side.month), String(side.year), lp, nm);
    } else {
      setMode(nm);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm text-muted">{label}</span>}
      <div className="flex gap-1">
        {(['solar', 'lunar'] as const).map((mo) => (
          <button
            key={mo}
            type="button"
            onClick={() => switchMode(mo)}
            className={`rounded-lg px-3 py-1 text-sm ${
              mode === mo ? 'bg-primary text-primary-fg' : 'bg-border text-muted'
            }`}
          >
            {mo === 'solar' ? 'Dương lịch' : 'Âm lịch'}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Ngày"
          value={day}
          onChange={(e) => {
            setDay(e.target.value);
            emit(e.target.value, month, year, leap, mode);
          }}
          className="w-16 rounded-lg border border-border bg-surface p-2"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Tháng"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            emit(day, e.target.value, year, leap, mode);
          }}
          className="w-16 rounded-lg border border-border bg-surface p-2"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Năm"
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            emit(day, month, e.target.value, leap, mode);
          }}
          className="w-24 rounded-lg border border-border bg-surface p-2"
        />
        {mode === 'lunar' && (
          <label className="flex items-center gap-1 text-sm text-muted">
            <input
              type="checkbox"
              checked={leap}
              onChange={(e) => {
                setLeap(e.target.checked);
                emit(day, month, year, e.target.checked, mode);
              }}
            />
            nhuận
          </label>
        )}
      </div>
      {other && (
        <p className="text-xs text-muted">
          {mode === 'solar'
            ? `≈ ÂL ${other.day}/${other.month} ${canChiOfYear(other.year)}`
            : `≈ DL ${other.day}/${other.month}/${other.year}`}
        </p>
      )}
    </div>
  );
}
