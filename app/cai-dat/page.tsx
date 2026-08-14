'use client';

import Link from 'next/link';
import { ElderlyToggle } from '@/components/ui/ElderlyToggle';
import { useAppStore } from '@/lib/store/useAppStore';
import { useClan } from '@/lib/data/useClan';
import { t } from '@/lib/i18n';
import type { Region } from '@/lib/domain/types';

const REGIONS: Array<{ value: Region | 'clan'; label: string }> = [
  { value: 'clan', label: 'Theo dòng họ' },
  { value: 'bac', label: 'Miền Bắc' },
  { value: 'trung', label: 'Miền Trung' },
  { value: 'nam', label: 'Miền Nam' },
];

export default function SettingsPage() {
  const { snapshot } = useClan();
  const regionOverride = useAppStore((s) => s.regionOverride);
  const setRegionOverride = useAppStore((s) => s.setRegionOverride);
  const selfId = useAppStore((s) => s.selfMemberId);
  const setSelf = useAppStore((s) => s.setSelf);

  const members = [...(snapshot?.members ?? [])].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, 'vi')
  );
  const clanRegion = snapshot?.clan.settings.region ?? 'trung';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">{t('settings.title')}</h1>

      <section>
        <ElderlyToggle />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">{t('settings.region')}</h2>
        <p className="text-sm text-muted">
          Dòng họ đang đặt mặc định: <b>{regionLabel(clanRegion)}</b>.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {REGIONS.map((r) => {
            const active =
              r.value === 'clan' ? regionOverride === null : regionOverride === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRegionOverride(r.value === 'clan' ? null : (r.value as Region))}
                className={`rounded-xl border p-3 text-left ${
                  active ? 'border-primary bg-primary/10' : 'border-border bg-surface'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">{t('settings.self')}</h2>
        <p className="text-sm text-muted">Chọn để app hiển thị bạn gọi mỗi người bằng gì.</p>
        <select
          value={selfId ?? ''}
          onChange={(e) => setSelf(e.target.value || null)}
          className="rounded-xl border border-border bg-surface p-3"
        >
          <option value="">— Chưa chọn —</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
      </section>

      <section>
        <Link
          href="/xuat-nhap"
          className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
        >
          <span className="font-medium">{t('settings.export')}</span>
          <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}

function regionLabel(r: Region): string {
  return r === 'bac' ? 'Miền Bắc' : r === 'nam' ? 'Miền Nam' : 'Miền Trung';
}
