'use client';

import Link from 'next/link';
import { useClan } from '@/lib/data/useClan';
import { ListView } from '@/components/tree/ListView';
import { t } from '@/lib/i18n';

export default function ListPage() {
  const { snapshot, loading } = useClan();

  if (loading) return <p className="text-muted">{t('common.loading')}</p>;
  if (!snapshot) {
    return (
      <p className="text-muted">
        {t('common.empty')}. Hãy thêm thành viên hoặc nhập dữ liệu ở{' '}
        <Link href="/xuat-nhap" className="text-primary underline">
          Xuất/Nhập
        </Link>
        .
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="truncate text-xl font-bold">{snapshot.clan.name}</h1>
        <Link href="/cay" className="shrink-0 text-sm text-primary">
          🌳 Xem cây →
        </Link>
      </div>
      <p className="mb-4 text-sm text-muted">{snapshot.members.length} thành viên</p>
      <ListView snapshot={snapshot} />
    </div>
  );
}
