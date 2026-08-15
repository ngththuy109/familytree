import Link from 'next/link';
import type { Member } from '@/lib/domain/types';

export function memberYears(m: Member): string {
  const b = m.birth?.solar?.year ?? m.birth?.lunar?.year;
  const d = m.death?.solar?.year ?? m.death?.lunar?.year;
  if (b == null && d == null) return '';
  if (m.isAlive) return `${b ?? '?'} –`;
  return `${b ?? '?'} – ${d ?? '?'}`;
}

export function MemberCard({
  member,
  subtitle,
  badge,
}: {
  member: Member;
  subtitle?: string | undefined;
  badge?: string | undefined;
}) {
  const initial = (member.givenName ?? member.fullName).trim().charAt(0).toUpperCase();
  const female = member.gender === 'female';
  return (
    <Link href={`/thanh-vien?id=${member.id}`} className="card flex items-center gap-3 p-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-semibold ${
          female ? 'bg-pink-100 text-pink-800' : 'bg-primary/15 text-primary'
        }`}
      >
        {member.photoUrl ? (
          <img src={member.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-medium">{member.fullName}</span>
          {!member.isAlive && (
            <span aria-label="đã mất" title="đã mất">
              🕯️
            </span>
          )}
        </span>
        <span className="block truncate text-sm text-muted">
          {[memberYears(member), subtitle].filter(Boolean).join(' · ')}
        </span>
      </span>
      {badge && (
        <span className="shrink-0 rounded-full bg-border px-2 py-0.5 text-xs text-muted">{badge}</span>
      )}
    </Link>
  );
}
