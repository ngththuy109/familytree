'use client';

import Link from 'next/link';
import type { ClanSnapshot, Member } from '@/lib/domain/types';
import { LunarSolarLabel } from '@/components/date/LunarSolarLabel';
import { RelationBadge } from '@/components/member/RelationBadge';
import { memberYears } from '@/components/member/MemberCard';
import { orderedChildren } from '@/lib/domain/ordering';
import { nextAnniversary } from '@/lib/domain/gio/anniversary';
import { t } from '@/lib/i18n';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 border-b border-border py-2 last:border-0">
      <span className="w-28 shrink-0 text-sm text-muted">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

function PersonLink({ member }: { member: Member }) {
  return (
    <Link href={`/thanh-vien?id=${member.id}`} className="text-primary underline">
      {member.fullName}
    </Link>
  );
}

export function MemberDetail({ member, snapshot }: { member: Member; snapshot: ClanSnapshot }) {
  const byId = new Map(snapshot.members.map((m) => [m.id, m] as const));
  const parents = snapshot.parentLinks
    .filter((p) => p.childId === member.id)
    .map((p) => ({ role: p.role, kind: p.kind, m: byId.get(p.parentId) }))
    .filter((x): x is { role: typeof x.role; kind: typeof x.kind; m: Member } => Boolean(x.m));
  const spouses = snapshot.unions
    .filter((u) => u.partnerAId === member.id || u.partnerBId === member.id)
    .map((u) => byId.get(u.partnerAId === member.id ? u.partnerBId : u.partnerAId))
    .filter((m): m is Member => Boolean(m));
  const children = orderedChildren(snapshot, member.id);
  const gio =
    !member.isAlive && member.death?.lunar
      ? nextAnniversary(member.death.lunar, new Date())
      : null;
  const initial = (member.givenName ?? member.fullName).trim().charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-4">
        <span
          className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full text-3xl font-semibold ${
            member.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-primary/15 text-primary'
          }`}
        >
          {member.photoUrl ? (
            <img src={member.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{member.fullName}</h1>
          {(member.tenTu || member.tenHieu) && (
            <p className="text-sm text-muted">
              {[member.tenTu && `tự ${member.tenTu}`, member.tenHieu && `hiệu ${member.tenHieu}`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          <p className="text-sm text-muted">
            {member.gender === 'female' ? t('member.female') : member.gender === 'male' ? t('member.male') : t('member.other')}
            {' · '}
            {member.isAlive ? t('member.alive') : t('member.dead')}
            {memberYears(member) && ` · ${memberYears(member)}`}
          </p>
        </div>
      </header>

      <RelationBadge memberId={member.id} snapshot={snapshot} />

      {gio && (
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-3">
          <span className="font-medium">🕯️ {t('gio.nextAnniversary')}: </span>
          <span>
            {gio.solar.day}/{gio.solar.month}/{gio.solar.year}
          </span>
          <span className="text-muted"> · còn {gio.daysUntil} ngày</span>
        </div>
      )}

      <section className="card p-4">
        <Row label={t('member.birth')}>
          <LunarSolarLabel date={member.birth} />
        </Row>
        {!member.isAlive && (
          <Row label={t('member.death')}>
            <LunarSolarLabel date={member.death} />
          </Row>
        )}
        {member.restingPlace && <Row label={t('member.restingPlace')}>{member.restingPlace}</Row>}
        {member.note && <Row label="Ghi chú">{member.note}</Row>}
      </section>

      {(member.biography || member.achievements) && (
        <section className="flex flex-col gap-3">
          {member.biography && (
            <div>
              <h2 className="mb-1 font-semibold">{t('member.biography')}</h2>
              <p className="whitespace-pre-line text-sm">{member.biography}</p>
            </div>
          )}
          {member.achievements && (
            <div>
              <h2 className="mb-1 font-semibold">{t('member.achievements')}</h2>
              <p className="whitespace-pre-line text-sm">{member.achievements}</p>
            </div>
          )}
        </section>
      )}

      <section className="card p-4">
        {parents.length > 0 && (
          <Row label="Cha/Mẹ">
            <span className="flex flex-wrap gap-x-3 gap-y-1">
              {parents.map((p) => (
                <span key={p.m.id}>
                  <PersonLink member={p.m} />
                  {p.kind === 'adopted' && <span className="text-muted"> (nuôi)</span>}
                </span>
              ))}
            </span>
          </Row>
        )}
        {spouses.length > 0 && (
          <Row label={t('member.spouse')}>
            <span className="flex flex-wrap gap-3">
              {spouses.map((s) => (
                <PersonLink key={s.id} member={s} />
              ))}
            </span>
          </Row>
        )}
        {children.length > 0 && (
          <Row label={`${t('member.children')} (${children.length})`}>
            <span className="flex flex-wrap gap-3">
              {children.map((c) => (
                <PersonLink key={c.id} member={c} />
              ))}
            </span>
          </Row>
        )}
      </section>

      <div className="flex gap-3">
        <Link
          href={`/sua?id=${member.id}`}
          className="rounded-xl border border-border px-4 py-2 text-sm"
        >
          ✏️ {t('common.edit')}
        </Link>
        <Link href="/quan-he" className="rounded-xl border border-border px-4 py-2 text-sm">
          👨‍👩‍👧 {t('relationship.title')}
        </Link>
      </div>
    </div>
  );
}
