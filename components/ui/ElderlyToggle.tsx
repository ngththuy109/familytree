'use client';

import { useAppStore } from '@/lib/store/useAppStore';
import { t } from '@/lib/i18n';

export function ElderlyToggle() {
  const elderly = useAppStore((s) => s.elderlyMode);
  const toggle = useAppStore((s) => s.toggleElderly);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={elderly}
      className={`flex w-full items-center justify-between rounded-xl border p-4 ${
        elderly ? 'border-primary bg-primary/10' : 'border-border bg-surface'
      }`}
    >
      <span className="font-medium">{t('settings.elderly')}</span>
      <span
        className={`rounded-full px-3 py-1 text-sm ${
          elderly ? 'bg-primary text-primary-fg' : 'bg-border text-muted'
        }`}
      >
        {elderly ? t('settings.elderlyOn') : t('settings.elderlyOff')}
      </span>
    </button>
  );
}
