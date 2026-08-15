'use client';

import { useClan } from '@/lib/data/useClan';
import { MemberForm } from '@/components/member/MemberForm';
import { t } from '@/lib/i18n';

export default function AddMemberPage() {
  const { snapshot, loading } = useClan();
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">{t('common.add')} thành viên</h1>
      {loading ? (
        <p className="text-muted">{t('common.loading')}</p>
      ) : snapshot ? (
        <MemberForm snapshot={snapshot} />
      ) : (
        <p className="text-muted">{t('common.empty')}</p>
      )}
    </div>
  );
}
