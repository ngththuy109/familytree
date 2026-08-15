'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClan } from '@/lib/data/useClan';
import { MemberForm } from '@/components/member/MemberForm';
import { t } from '@/lib/i18n';

function EditInner() {
  const id = useSearchParams().get('id');
  const { snapshot, loading } = useClan();
  if (loading) return <p className="text-muted">{t('common.loading')}</p>;
  const member = snapshot?.members.find((m) => m.id === id);
  if (!snapshot || !member) return <p className="text-muted">Không tìm thấy thành viên.</p>;
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">
        {t('common.edit')}: {member.fullName}
      </h1>
      <MemberForm snapshot={snapshot} member={member} />
    </div>
  );
}

export default function EditMemberPage() {
  return (
    <Suspense fallback={<p className="text-muted">{t('common.loading')}</p>}>
      <EditInner />
    </Suspense>
  );
}
