'use client';

import { useMemo, useState } from 'react';
import type { ClanSnapshot } from '@/lib/domain/types';
import { relate } from '@/lib/domain/kinship';
import { applyRegionOverride } from '@/lib/data/region';
import { useAppStore } from '@/lib/store/useAppStore';
import { t } from '@/lib/i18n';

export function RelationshipFinder({ snapshot }: { snapshot: ClanSnapshot }) {
  const regionOverride = useAppStore((s) => s.regionOverride);
  const selfId = useAppStore((s) => s.selfMemberId);
  const members = useMemo(
    () => [...snapshot.members].sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi')),
    [snapshot]
  );
  const [a, setA] = useState<string>(selfId ?? members[0]?.id ?? '');
  const [b, setB] = useState<string>(members[1]?.id ?? '');

  const snap = useMemo(() => applyRegionOverride(snapshot, regionOverride), [snapshot, regionOverride]);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.fullName ?? '';

  const result = a && b && a !== b ? relate(snap, a, b) : null;

  return (
    <div className="flex flex-col gap-4">
      <Picker label={t('relationship.personA')} value={a} onChange={setA} members={members} />
      <Picker label={t('relationship.personB')} value={b} onChange={setB} members={members} />

      {a === b && a !== '' && <p className="text-muted">Hãy chọn hai người khác nhau.</p>}

      {result && (
        <div className="card flex flex-col gap-2 p-4">
          <p className="text-lg">
            <b>{nameOf(a)}</b> gọi <b>{nameOf(b)}</b> là{' '}
            <span className="text-xl font-bold text-primary">{result.term}</span>
          </p>
          <p className="text-lg">
            <b>{nameOf(b)}</b> gọi <b>{nameOf(a)}</b> là{' '}
            <span className="text-xl font-bold text-primary">{result.reciprocal}</span>
          </p>
          {result.description && <p className="text-sm text-muted">{result.description}</p>}
          {result.confidence === 'fallback' && (
            <p className="text-sm text-muted">{t('relationship.approx')}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Picker({
  label,
  value,
  onChange,
  members,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  members: ClanSnapshot['members'];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-surface p-3 text-lg"
      >
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.fullName}
          </option>
        ))}
      </select>
    </label>
  );
}
