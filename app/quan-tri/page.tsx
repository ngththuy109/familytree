'use client';

import Link from 'next/link';
import { useClan } from '@/lib/data/useClan';
import { getRepository } from '@/lib/data';
import { memberYears } from '@/components/member/MemberCard';
import { t } from '@/lib/i18n';

export default function AdminPage() {
  const { snapshot, loading, reload } = useClan();

  async function remove(id: string, name: string) {
    if (typeof window !== 'undefined' && window.confirm(`Xóa "${name}"? Thao tác không hoàn tác.`)) {
      await getRepository().members.delete(id);
      reload();
    }
  }

  if (loading) return <p className="text-muted">{t('common.loading')}</p>;
  if (!snapshot) return <p className="text-muted">{t('common.empty')}</p>;

  const members = [...snapshot.members].sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản trị thành viên</h1>
        <div className="flex gap-2">
          <Link href="/chi-phai" className="rounded-xl border border-border px-3 py-2 text-sm">
            Chi/Phái
          </Link>
          <Link href="/them" className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-fg">
            ＋ {t('common.add')}
          </Link>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-2 py-2">
            <Link href={`/thanh-vien?id=${m.id}`} className="min-w-0 flex-1">
              <span className="block truncate font-medium">{m.fullName}</span>
              <span className="block text-sm text-muted">{memberYears(m)}</span>
            </Link>
            <Link href={`/sua?id=${m.id}`} className="rounded-lg border border-border px-3 py-1 text-sm">
              {t('common.edit')}
            </Link>
            <button
              type="button"
              onClick={() => remove(m.id, m.fullName)}
              className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600"
            >
              {t('common.delete')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
