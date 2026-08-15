'use client';

import { useMemo, useState } from 'react';
import { useClan } from '@/lib/data/useClan';
import { MemberCard } from '@/components/member/MemberCard';
import { matchesQuery } from '@/lib/search/normalize';
import { resolveGenerations } from '@/lib/domain/ordering';
import { t } from '@/lib/i18n';

export default function SearchPage() {
  const { snapshot } = useClan();
  const [q, setQ] = useState('');
  const [gen, setGen] = useState<number | ''>('');
  const [branch, setBranch] = useState('');

  const gens = useMemo(
    () => (snapshot ? resolveGenerations(snapshot) : new Map<string, number>()),
    [snapshot]
  );

  const genOptions = useMemo(() => {
    const set = new Set<number>();
    for (const g of gens.values()) set.add(g);
    return [...set].sort((a, b) => a - b);
  }, [gens]);

  const results = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.members.filter((m) => {
      if (q && !matchesQuery(`${m.fullName} ${m.tenTu ?? ''} ${m.tenHieu ?? ''}`, q)) return false;
      if (gen !== '' && (gens.get(m.id) ?? -1) !== gen) return false;
      if (branch && m.branchId !== branch) return false;
      return true;
    });
  }, [snapshot, q, gen, branch, gens]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">{t('nav.search')}</h1>

      <input
        type="search"
        inputMode="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('search.placeholder')}
        className="w-full rounded-xl border border-border bg-surface p-4 text-lg"
        aria-label={t('search.placeholder')}
      />

      <div className="flex gap-2">
        <select
          value={gen}
          onChange={(e) => setGen(e.target.value === '' ? '' : Number(e.target.value))}
          className="flex-1 rounded-xl border border-border bg-surface p-2 text-sm"
          aria-label={t('search.byGeneration')}
        >
          <option value="">{t('search.byGeneration')}</option>
          {genOptions.map((g) => (
            <option key={g} value={g}>
              Đời {g}
            </option>
          ))}
        </select>
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-surface p-2 text-sm"
          aria-label={t('search.byBranch')}
        >
          <option value="">{t('search.byBranch')}</option>
          {(snapshot?.branches ?? []).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted">{results.length} kết quả</p>
      <div className="flex flex-col gap-2">
        {results.map((m) => (
          <MemberCard key={m.id} member={m} badge={`Đời ${gens.get(m.id) ?? '?'}`} />
        ))}
        {results.length === 0 && <p className="text-muted">{t('search.noResult')}</p>}
      </div>
    </div>
  );
}
