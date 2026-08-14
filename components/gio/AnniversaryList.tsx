'use client';

import Link from 'next/link';
import type { Reminder } from '@/lib/domain/gio/anniversary';
import { canChiOfYear } from '@/lib/domain/lunar';
import { t } from '@/lib/i18n';

function Item({ r }: { r: Reminder }) {
  const { member, anniversary } = r;
  const dueLabel =
    anniversary.daysUntil === 0
      ? t('gio.today')
      : `còn ${anniversary.daysUntil} ngày`;
  return (
    <Link
      href={`/thanh-vien?id=${member.id}`}
      className={`card flex items-center justify-between gap-3 p-3 ${
        r.remind ? 'border-accent/50 bg-accent/10' : ''
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate font-medium">🕯️ {member.fullName}</span>
        <span className="block text-sm text-muted">
          {anniversary.solar.day}/{anniversary.solar.month}/{anniversary.solar.year} · ÂL{' '}
          {anniversary.lunar.day}/{anniversary.lunar.month} ({canChiOfYear(anniversary.lunar.year)})
        </span>
      </span>
      <span
        className={`shrink-0 rounded-full px-2 py-1 text-xs ${
          r.remind ? 'bg-accent text-white' : 'bg-border text-muted'
        }`}
      >
        {dueLabel}
      </span>
    </Link>
  );
}

export function AnniversaryList({ reminders }: { reminders: Reminder[] }) {
  if (reminders.length === 0) {
    return <p className="text-muted">{t('gio.none')}</p>;
  }
  const soon = reminders.filter((r) => r.remind);
  const month = reminders.filter((r) => !r.remind && r.anniversary.daysUntil <= 30);
  const later = reminders.filter((r) => !r.remind && r.anniversary.daysUntil > 30);

  return (
    <div className="flex flex-col gap-6">
      {soon.length > 0 && (
        <Group title={t('gio.remindSoon')} items={soon} />
      )}
      {month.length > 0 && <Group title="Trong tháng" items={month} />}
      {later.length > 0 && <Group title="Các giỗ khác trong năm" items={later} />}
    </div>
  );
}

function Group({ title, items }: { title: string; items: Reminder[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map((r) => (
          <Item key={r.member.id} r={r} />
        ))}
      </div>
    </section>
  );
}
