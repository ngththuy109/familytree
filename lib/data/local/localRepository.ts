// Hiện thực DataRepository trên IndexedDB (local-first). Chạy phía trình duyệt.

import type {
  Branch,
  Clan,
  ClanSnapshot,
  ID,
  Invite,
  Member,
  MemberFilter,
  Membership,
  NewBranch,
  NewClan,
  NewMember,
  NewParentLink,
  NewUnion,
  ParentLink,
  Role,
  Union,
} from '@/lib/domain/types';
import type { DataRepository } from '../repository';
import { getDB, type StoreName } from './db';

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Math.floor(performance.now() * 1000)}-${Date.now()}`;
}
function nowIso(): string {
  return new Date().toISOString();
}

async function allByClan<T>(store: StoreName, clanId: ID): Promise<T[]> {
  const db = await getDB();
  return (await db.getAllFromIndex(store, 'clanId', clanId)) as T[];
}

function applyFilter(members: Member[], f?: MemberFilter): Member[] {
  if (!f) return members;
  return members.filter((m) => {
    if (f.aliveOnly && !m.isAlive) return false;
    if (f.generation != null && m.generation !== f.generation) return false;
    if (f.branchId && m.branchId !== f.branchId) return false;
    if (f.query && !m.fullName.toLowerCase().includes(f.query.toLowerCase())) return false;
    return true;
  });
}

export function createLocalRepository(): DataRepository {
  const repo: DataRepository = {
    clans: {
      async list() {
        return (await getDB()).getAll('clans') as Promise<Clan[]>;
      },
      async get(id) {
        return ((await (await getDB()).get('clans', id)) as Clan | undefined) ?? null;
      },
      async create(c: NewClan) {
        const clan: Clan = { ...c, id: uid(), createdAt: nowIso(), updatedAt: nowIso() };
        await (await getDB()).put('clans', clan);
        return clan;
      },
      async update(id, patch) {
        const db = await getDB();
        const cur = (await db.get('clans', id)) as Clan | undefined;
        if (!cur) throw new Error('Không tìm thấy dòng họ');
        const next: Clan = { ...cur, ...patch, id: cur.id, updatedAt: nowIso() };
        await db.put('clans', next);
        return next;
      },
    },

    members: {
      async listByClan(clanId, filter) {
        return applyFilter(await allByClan<Member>('members', clanId), filter);
      },
      async get(id) {
        return ((await (await getDB()).get('members', id)) as Member | undefined) ?? null;
      },
      async create(m: NewMember) {
        const member: Member = { ...m, id: uid(), createdAt: nowIso(), updatedAt: nowIso() };
        await (await getDB()).put('members', member);
        return member;
      },
      async update(id, patch) {
        const db = await getDB();
        const cur = (await db.get('members', id)) as Member | undefined;
        if (!cur) throw new Error('Không tìm thấy thành viên');
        const next: Member = { ...cur, ...patch, id: cur.id, updatedAt: nowIso() };
        await db.put('members', next);
        return next;
      },
      async delete(id) {
        await (await getDB()).delete('members', id);
      },
    },

    parentLinks: {
      async listByClan(clanId) {
        return allByClan<ParentLink>('parentLinks', clanId);
      },
      async create(p: NewParentLink) {
        const link: ParentLink = { ...p, id: uid() };
        await (await getDB()).put('parentLinks', link);
        return link;
      },
      async delete(id) {
        await (await getDB()).delete('parentLinks', id);
      },
    },

    unions: {
      async listByClan(clanId) {
        return allByClan<Union>('unions', clanId);
      },
      async create(u: NewUnion) {
        const union: Union = { ...u, id: uid() };
        await (await getDB()).put('unions', union);
        return union;
      },
      async update(id, patch) {
        const db = await getDB();
        const cur = (await db.get('unions', id)) as Union | undefined;
        if (!cur) throw new Error('Không tìm thấy hôn phối');
        const next: Union = { ...cur, ...patch, id: cur.id };
        await db.put('unions', next);
        return next;
      },
      async delete(id) {
        await (await getDB()).delete('unions', id);
      },
    },

    branches: {
      async listByClan(clanId) {
        return allByClan<Branch>('branches', clanId);
      },
      async create(b: NewBranch) {
        const branch: Branch = { ...b, id: uid() };
        await (await getDB()).put('branches', branch);
        return branch;
      },
      async update(id, patch) {
        const db = await getDB();
        const cur = (await db.get('branches', id)) as Branch | undefined;
        if (!cur) throw new Error('Không tìm thấy chi/phái');
        const next: Branch = { ...cur, ...patch, id: cur.id };
        await db.put('branches', next);
        return next;
      },
      async delete(id) {
        await (await getDB()).delete('branches', id);
      },
    },

    memberships: {
      async listByClan(clanId) {
        return allByClan<Membership>('memberships', clanId);
      },
      // Ở bản local, người dùng là chủ họ.
      async myRole(): Promise<Role | null> {
        return 'owner';
      },
    },

    invites: {
      async listByClan(clanId) {
        return allByClan<Invite>('invites', clanId);
      },
      async create(clanId, role, maxUses = null) {
        const invite: Invite = {
          id: uid(),
          clanId,
          code: Math.random().toString(36).slice(2, 8).toUpperCase(),
          role,
          maxUses,
          usedCount: 0,
          expiresAt: null,
          revoked: false,
          createdBy: 'local',
          createdAt: nowIso(),
        };
        await (await getDB()).put('invites', invite);
        return invite;
      },
      async redeem(): Promise<Membership> {
        throw new Error('Mã mời chỉ hoạt động khi bật Supabase.');
      },
    },

    async snapshot(clanId: ID): Promise<ClanSnapshot> {
      const db = await getDB();
      const clan = (await db.get('clans', clanId)) as Clan | undefined;
      if (!clan) throw new Error('Không tìm thấy dòng họ');
      const [members, parentLinks, unions, branches] = await Promise.all([
        allByClan<Member>('members', clanId),
        allByClan<ParentLink>('parentLinks', clanId),
        allByClan<Union>('unions', clanId),
        allByClan<Branch>('branches', clanId),
      ]);
      return { clan, members, parentLinks, unions, branches };
    },

    async importSnapshot(snap: ClanSnapshot): Promise<void> {
      const db = await getDB();
      const tx = db.transaction(['clans', 'members', 'parentLinks', 'unions', 'branches'], 'readwrite');
      await tx.objectStore('clans').put(snap.clan);
      await Promise.all([
        ...snap.members.map((m) => tx.objectStore('members').put(m)),
        ...snap.parentLinks.map((p) => tx.objectStore('parentLinks').put(p)),
        ...snap.unions.map((u) => tx.objectStore('unions').put(u)),
        ...snap.branches.map((b) => tx.objectStore('branches').put(b)),
      ]);
      await tx.done;
    },
  };

  return repo;
}
