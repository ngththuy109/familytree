// Ánh xạ row (snake_case, Postgres) ↔ domain (camelCase).
import type {
  Branch,
  Clan,
  DualDate,
  Invite,
  Member,
  Membership,
  ParentLink,
  Role,
  Union,
} from '@/lib/domain/types';

type Row = Record<string, unknown>;

const asDual = (v: unknown): DualDate | null => (v ? (v as DualDate) : null);

export function memberFromRow(r: Row): Member {
  return {
    id: r.id as string,
    clanId: r.clan_id as string,
    branchId: (r.branch_id as string | null) ?? null,
    fullName: r.full_name as string,
    familyName: (r.family_name as string | undefined) ?? undefined,
    givenName: (r.given_name as string | undefined) ?? undefined,
    tenTu: (r.ten_tu as string | undefined) ?? undefined,
    tenHieu: (r.ten_hieu as string | undefined) ?? undefined,
    otherNames: (r.other_names as string[] | undefined) ?? undefined,
    gender: (r.gender as Member['gender']) ?? 'unknown',
    isAlive: Boolean(r.is_alive),
    birth: asDual(r.birth),
    death: asDual(r.death),
    restingPlace: (r.resting_place as string | null) ?? null,
    photoUrl: (r.photo_url as string | null) ?? null,
    biography: (r.biography as string | null) ?? null,
    achievements: (r.achievements as string | null) ?? null,
    siblingOrder: (r.sibling_order as number | null) ?? null,
    generation: (r.generation as number | null) ?? null,
    note: (r.note as string | null) ?? null,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
    updatedAt: (r.updated_at as string) ?? new Date().toISOString(),
  };
}

export function memberToRow(m: Partial<Member>): Row {
  const row: Row = {};
  const set = (k: string, v: unknown) => {
    if (v !== undefined) row[k] = v;
  };
  set('clan_id', m.clanId);
  set('branch_id', m.branchId ?? null);
  set('full_name', m.fullName);
  set('family_name', m.familyName ?? null);
  set('given_name', m.givenName ?? null);
  set('ten_tu', m.tenTu ?? null);
  set('ten_hieu', m.tenHieu ?? null);
  set('other_names', m.otherNames ?? null);
  set('gender', m.gender);
  set('is_alive', m.isAlive);
  set('birth', m.birth ?? null);
  set('death', m.death ?? null);
  set('resting_place', m.restingPlace ?? null);
  set('photo_url', m.photoUrl ?? null);
  set('biography', m.biography ?? null);
  set('achievements', m.achievements ?? null);
  set('sibling_order', m.siblingOrder ?? null);
  set('generation', m.generation ?? null);
  set('note', m.note ?? null);
  return row;
}

export function parentLinkFromRow(r: Row): ParentLink {
  return {
    id: r.id as string,
    clanId: r.clan_id as string,
    parentId: r.parent_id as string,
    childId: r.child_id as string,
    role: r.role as ParentLink['role'],
    kind: r.kind as ParentLink['kind'],
    unionId: (r.union_id as string | null) ?? null,
  };
}
export function parentLinkToRow(p: Partial<ParentLink>): Row {
  return {
    clan_id: p.clanId,
    parent_id: p.parentId,
    child_id: p.childId,
    role: p.role,
    kind: p.kind,
    union_id: p.unionId ?? null,
  };
}

export function unionFromRow(r: Row): Union {
  return {
    id: r.id as string,
    clanId: r.clan_id as string,
    partnerAId: r.partner_a_id as string,
    partnerBId: r.partner_b_id as string,
    status: r.status as Union['status'],
    order: (r.order as number | null) ?? null,
    startDate: asDual(r.start_date),
    endDate: asDual(r.end_date),
    note: (r.note as string | null) ?? null,
  };
}
export function unionToRow(u: Partial<Union>): Row {
  return {
    clan_id: u.clanId,
    partner_a_id: u.partnerAId,
    partner_b_id: u.partnerBId,
    status: u.status,
    order: u.order ?? null,
    start_date: u.startDate ?? null,
    end_date: u.endDate ?? null,
    note: u.note ?? null,
  };
}

export function branchFromRow(r: Row): Branch {
  return {
    id: r.id as string,
    clanId: r.clan_id as string,
    name: r.name as string,
    kind: r.kind as Branch['kind'],
    parentBranchId: (r.parent_branch_id as string | null) ?? null,
    rootMemberId: (r.root_member_id as string | null) ?? null,
    note: (r.note as string | null) ?? null,
  };
}
export function branchToRow(b: Partial<Branch>): Row {
  return {
    clan_id: b.clanId,
    name: b.name,
    kind: b.kind,
    parent_branch_id: b.parentBranchId ?? null,
    root_member_id: b.rootMemberId ?? null,
    note: b.note ?? null,
  };
}

export function clanFromRow(r: Row): Clan {
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string | null) ?? null,
    founderMemberId: (r.founder_member_id as string | null) ?? null,
    coverImageUrl: (r.cover_image_url as string | null) ?? null,
    settings: (r.settings as Clan['settings']) ?? { region: 'trung', timezoneOffset: 7 },
    createdBy: r.created_by as string,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
    updatedAt: (r.updated_at as string) ?? new Date().toISOString(),
  };
}
export function clanToRow(c: Partial<Clan>): Row {
  return {
    name: c.name,
    description: c.description ?? null,
    founder_member_id: c.founderMemberId ?? null,
    cover_image_url: c.coverImageUrl ?? null,
    settings: c.settings,
    created_by: c.createdBy,
  };
}

export function inviteFromRow(r: Row): Invite {
  return {
    id: r.id as string,
    clanId: r.clan_id as string,
    code: r.code as string,
    role: r.role as Role,
    maxUses: (r.max_uses as number | null) ?? null,
    usedCount: (r.used_count as number) ?? 0,
    expiresAt: (r.expires_at as string | null) ?? null,
    revoked: Boolean(r.revoked),
    createdBy: r.created_by as string,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

export function membershipFromRow(r: Row): Membership {
  return {
    id: r.id as string,
    clanId: r.clan_id as string,
    userId: r.user_id as string,
    role: r.role as Membership['role'],
    linkedMemberId: (r.linked_member_id as string | null) ?? null,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}
