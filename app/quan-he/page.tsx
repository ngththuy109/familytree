'use client';

import { useClan } from '@/lib/data/useClan';
import { RelationshipFinder } from '@/components/relationship/RelationshipFinder';
import { t } from '@/lib/i18n';

export default function RelationshipPage() {
  const { snapshot, loading } = useClan();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">{t('relationship.title')}</h1>
        <p className="text-sm text-muted">
          Chọn 2 người bất kỳ để xem cách xưng hô chuẩn (theo vùng miền của dòng họ).
        </p>
      </div>
      {loading && <p className="text-muted">{t('common.loading')}</p>}
      {snapshot && <RelationshipFinder snapshot={snapshot} />}
    </div>
  );
}
