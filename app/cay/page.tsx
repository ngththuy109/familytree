'use client';

import dynamic from 'next/dynamic';
import { useClan } from '@/lib/data/useClan';
import { t } from '@/lib/i18n';

// Code-split: chỉ tải d3 + SVG khi mở trang cây.
const TreeCanvas = dynamic(() => import('@/components/tree/TreeCanvas').then((m) => m.TreeCanvas), {
  ssr: false,
  loading: () => <p className="text-muted">Đang tải cây gia phả…</p>,
});

export default function TreePage() {
  const { snapshot, loading } = useClan();
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">Cây gia phả</h1>
      {loading ? (
        <p className="text-muted">{t('common.loading')}</p>
      ) : snapshot ? (
        <TreeCanvas snapshot={snapshot} />
      ) : (
        <p className="text-muted">{t('common.empty')}</p>
      )}
    </div>
  );
}
