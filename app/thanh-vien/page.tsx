'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useClan } from '@/lib/data/useClan';
import { MemberDetail } from '@/components/member/MemberDetail';
import { t } from '@/lib/i18n';

function ProfileInner() {
  const id = useSearchParams().get('id');
  const { snapshot, loading } = useClan();

  if (loading) return <p className="text-muted">{t('common.loading')}</p>;
  const member = snapshot?.members.find((m) => m.id === id);
  if (!snapshot || !member) {
    return (
      <div className="text-muted">
        <p>Không tìm thấy thành viên.</p>
        <Link href="/danh-sach" className="text-primary underline">
          ← {t('nav.list')}
        </Link>
      </div>
    );
  }
  return (
    <div>
      <Link href="/danh-sach" className="mb-3 inline-block text-sm text-primary">
        ← {t('common.back')}
      </Link>
      <MemberDetail member={member} snapshot={snapshot} />
    </div>
  );
}

export default function MemberPage() {
  return (
    <Suspense fallback={<p className="text-muted">{t('common.loading')}</p>}>
      <ProfileInner />
    </Suspense>
  );
}
