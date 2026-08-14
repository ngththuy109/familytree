'use client';

import { useState } from 'react';
import { useClan } from '@/lib/data/useClan';
import { getRepository } from '@/lib/data';
import type { BranchKind } from '@/lib/domain/types';
import { t } from '@/lib/i18n';

const KINDS: Array<{ value: BranchKind; label: string }> = [
  { value: 'phai', label: 'Phái' },
  { value: 'chi', label: 'Chi' },
  { value: 'nhanh', label: 'Nhánh' },
  { value: 'other', label: 'Khác' },
];

export default function BranchesPage() {
  const { snapshot, loading, reload } = useClan();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<BranchKind>('chi');
  const [parent, setParent] = useState('');

  async function add() {
    if (!snapshot || !name.trim()) return;
    await getRepository().branches.create({
      clanId: snapshot.clan.id,
      name: name.trim(),
      kind,
      parentBranchId: parent || null,
      rootMemberId: null,
      note: null,
    });
    setName('');
    reload();
  }

  async function remove(id: string, nm: string) {
    if (typeof window !== 'undefined' && window.confirm(`Xóa "${nm}"?`)) {
      await getRepository().branches.delete(id);
      reload();
    }
  }

  if (loading) return <p className="text-muted">{t('common.loading')}</p>;
  if (!snapshot) return <p className="text-muted">{t('common.empty')}</p>;

  const inputCls = 'w-full rounded-xl border border-border bg-surface p-3';

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold">Chi / Phái</h1>

      <div className="card flex flex-col gap-3 p-4">
        <h2 className="font-semibold">{t('common.add')} chi/phái</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên chi/phái"
          className={inputCls}
        />
        <div className="flex gap-2">
          <select value={kind} onChange={(e) => setKind(e.target.value as BranchKind)} className={inputCls}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <select value={parent} onChange={(e) => setParent(e.target.value)} className={inputCls}>
            <option value="">Không thuộc phái nào</option>
            {snapshot.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={add}
          className="self-start rounded-xl bg-primary px-4 py-2 font-semibold text-primary-fg"
        >
          {t('common.add')}
        </button>
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {snapshot.branches.map((b) => (
          <li key={b.id} className="flex items-center gap-2 py-3">
            <span className="flex-1">
              <span className="font-medium">{b.name}</span>
              <span className="ml-2 rounded-full bg-border px-2 py-0.5 text-xs text-muted">
                {KINDS.find((k) => k.value === b.kind)?.label ?? b.kind}
              </span>
            </span>
            <button
              type="button"
              onClick={() => remove(b.id, b.name)}
              className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600"
            >
              {t('common.delete')}
            </button>
          </li>
        ))}
        {snapshot.branches.length === 0 && <li className="py-3 text-muted">{t('common.empty')}</li>}
      </ul>
    </div>
  );
}
