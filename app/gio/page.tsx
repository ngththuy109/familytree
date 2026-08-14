'use client';

import { useMemo } from 'react';
import { useClan } from '@/lib/data/useClan';
import { upcomingAnniversaries } from '@/lib/domain/gio/anniversary';
import { AnniversaryList } from '@/components/gio/AnniversaryList';
import { t } from '@/lib/i18n';

export default function GioPage() {
  const { snapshot, loading } = useClan();

  const reminders = useMemo(() => {
    if (!snapshot) return [];
    const days = snapshot.clan.settings.remindLeadDays ?? 7;
    return upcomingAnniversaries(snapshot.members, { days }, new Date());
  }, [snapshot]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">{t('gio.title')}</h1>
        <p className="text-sm text-muted">Nhắc trước 3–7 ngày theo ngày mất Âm lịch.</p>
      </div>
      {loading ? <p className="text-muted">{t('common.loading')}</p> : <AnniversaryList reminders={reminders} />}
    </div>
  );
}
