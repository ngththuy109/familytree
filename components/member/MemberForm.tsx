'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ClanSnapshot, DualDate, Gender, Member, NewMember } from '@/lib/domain/types';
import { DualDateInput } from '@/components/date/DualDateInput';
import { getRepository } from '@/lib/data';
import { useClan } from '@/lib/data/useClan';
import { t } from '@/lib/i18n';

async function reconcileParents(
  snapshot: ClanSnapshot,
  clanId: string,
  childId: string,
  fatherId: string,
  motherId: string
) {
  const repo = getRepository();
  const existing = snapshot.parentLinks.filter((p) => p.childId === childId);
  for (const p of existing) await repo.parentLinks.delete(p.id);
  if (fatherId) {
    await repo.parentLinks.create({ clanId, parentId: fatherId, childId, role: 'father', kind: 'biological', unionId: null });
  }
  if (motherId) {
    await repo.parentLinks.create({ clanId, parentId: motherId, childId, role: 'mother', kind: 'biological', unionId: null });
  }
}

export function MemberForm({ snapshot, member }: { snapshot: ClanSnapshot; member?: Member }) {
  const router = useRouter();
  const { reload } = useClan();
  const clanId = snapshot.clan.id;

  const curFather = member
    ? snapshot.parentLinks.find((p) => p.childId === member.id && p.role === 'father')?.parentId
    : undefined;
  const curMother = member
    ? snapshot.parentLinks.find((p) => p.childId === member.id && p.role === 'mother')?.parentId
    : undefined;

  const [fullName, setFullName] = useState(member?.fullName ?? '');
  const [gender, setGender] = useState<Gender>(member?.gender ?? 'male');
  const [tenTu, setTenTu] = useState(member?.tenTu ?? '');
  const [tenHieu, setTenHieu] = useState(member?.tenHieu ?? '');
  const [isAlive, setIsAlive] = useState(member?.isAlive ?? true);
  const [birth, setBirth] = useState<DualDate | null>(member?.birth ?? null);
  const [death, setDeath] = useState<DualDate | null>(member?.death ?? null);
  const [restingPlace, setRestingPlace] = useState(member?.restingPlace ?? '');
  const [biography, setBiography] = useState(member?.biography ?? '');
  const [achievements, setAchievements] = useState(member?.achievements ?? '');
  const [branchId, setBranchId] = useState(member?.branchId ?? '');
  const [siblingOrder, setSiblingOrder] = useState(
    member?.siblingOrder != null ? String(member.siblingOrder) : ''
  );
  const [fatherId, setFatherId] = useState(curFather ?? '');
  const [motherId, setMotherId] = useState(curMother ?? '');
  const [spouseId, setSpouseId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const others = useMemo(
    () =>
      [...snapshot.members]
        .filter((m) => m.id !== member?.id)
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi')),
    [snapshot, member]
  );

  async function save() {
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }
    if (fatherId && fatherId === member?.id) {
      setError('Không thể chọn chính mình làm cha.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: NewMember = {
        clanId,
        branchId: branchId || null,
        fullName: fullName.trim(),
        gender,
        tenTu: tenTu || undefined,
        tenHieu: tenHieu || undefined,
        isAlive,
        birth,
        death: isAlive ? null : death,
        restingPlace: restingPlace || null,
        photoUrl: member?.photoUrl ?? null,
        biography: biography || null,
        achievements: achievements || null,
        siblingOrder: siblingOrder ? parseInt(siblingOrder, 10) : null,
        generation: null,
        note: member?.note ?? null,
      };
      const repo = getRepository();
      const saved = member
        ? await repo.members.update(member.id, payload)
        : await repo.members.create(payload);
      await reconcileParents(snapshot, clanId, saved.id, fatherId, motherId);
      if (spouseId) {
        const exists = snapshot.unions.some(
          (u) =>
            (u.partnerAId === saved.id && u.partnerBId === spouseId) ||
            (u.partnerBId === saved.id && u.partnerAId === spouseId)
        );
        if (!exists) {
          await repo.unions.create({
            clanId,
            partnerAId: saved.id,
            partnerBId: spouseId,
            status: 'married',
            order: null,
            startDate: null,
            endDate: null,
            note: null,
          });
        }
      }
      reload();
      router.push(`/thanh-vien?id=${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi khi lưu.');
      setSaving(false);
    }
  }

  const inputCls = 'w-full rounded-xl border border-border bg-surface p-3';

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">{t('member.fullName')} *</span>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} required />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-muted">{t('member.tenTu')}</span>
          <input value={tenTu} onChange={(e) => setTenTu(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-muted">{t('member.tenHieu')}</span>
          <input value={tenHieu} onChange={(e) => setTenHieu(e.target.value)} className={inputCls} />
        </label>
      </div>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-muted">{t('member.gender')}</span>
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputCls}>
            <option value="male">{t('member.male')}</option>
            <option value="female">{t('member.female')}</option>
            <option value="other">{t('member.other')}</option>
            <option value="unknown">—</option>
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-muted">{t('member.siblingOrder')}</span>
          <input
            type="number"
            value={siblingOrder}
            onChange={(e) => setSiblingOrder(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isAlive} onChange={(e) => setIsAlive(e.target.checked)} />
        <span>{t('member.alive')}</span>
      </label>

      <div className="card p-3">
        <DualDateInput value={birth} onChange={setBirth} label={t('member.birth')} />
      </div>
      {!isAlive && (
        <>
          <div className="card p-3">
            <DualDateInput value={death} onChange={setDeath} label={t('member.death')} />
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted">{t('member.restingPlace')}</span>
            <input value={restingPlace} onChange={(e) => setRestingPlace(e.target.value)} className={inputCls} />
          </label>
        </>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">{t('member.branch')}</span>
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className={inputCls}>
          <option value="">—</option>
          {snapshot.branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <PersonSelect label={t('member.father')} value={fatherId} onChange={setFatherId} members={others} />
        <PersonSelect label={t('member.mother')} value={motherId} onChange={setMotherId} members={others} />
      </div>
      <PersonSelect label={`${t('member.spouse')} (thêm)`} value={spouseId} onChange={setSpouseId} members={others} />

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">{t('member.biography')}</span>
        <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={3} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">{t('member.achievements')}</span>
        <textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={2} className={inputCls} />
      </label>

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-fg disabled:opacity-60"
        >
          {saving ? t('common.loading') : t('common.save')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border px-5 py-3"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}

function PersonSelect({
  label,
  value,
  onChange,
  members,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  members: Member[];
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-sm text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface p-3"
      >
        <option value="">—</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.fullName}
          </option>
        ))}
      </select>
    </label>
  );
}
