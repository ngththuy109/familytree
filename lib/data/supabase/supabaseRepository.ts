// Hiện thực DataRepository trên Supabase (bật khi có env). Cùng interface với bản
// local để UI không phân biệt backend.

import type { ClanSnapshot, ID } from '@/lib/domain/types';
import type { DataRepository } from '../repository';
import { getSupabaseClient } from './client';
import {
  branchFromRow,
  branchToRow,
  clanFromRow,
  clanToRow,
  inviteFromRow,
  memberFromRow,
  membershipFromRow,
  memberToRow,
  parentLinkFromRow,
  parentLinkToRow,
  unionFromRow,
  unionToRow,
} from './mappers';

type Row = Record<string, unknown>;

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export function createSupabaseRepository(): DataRepository {
  return {
    clans: {
      async list() {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('clans').select('*');
        fail(error);
        return ((data as Row[]) ?? []).map(clanFromRow);
      },
      async get(id) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('clans').select('*').eq('id', id).maybeSingle();
        fail(error);
        return data ? clanFromRow(data as Row) : null;
      },
      async create(c) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('clans').insert(clanToRow(c)).select().single();
        fail(error);
        return clanFromRow(data as Row);
      },
      async update(id, patch) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('clans').update(clanToRow(patch)).eq('id', id).select().single();
        fail(error);
        return clanFromRow(data as Row);
      },
    },

    members: {
      async listByClan(clanId, filter) {
        const sb = await getSupabaseClient();
        let q = sb.from('members').select('*').eq('clan_id', clanId);
        if (filter?.branchId) q = q.eq('branch_id', filter.branchId);
        if (filter?.generation != null) q = q.eq('generation', filter.generation);
        if (filter?.aliveOnly) q = q.eq('is_alive', true);
        const { data, error } = await q;
        fail(error);
        let rows = ((data as Row[]) ?? []).map(memberFromRow);
        if (filter?.query) {
          const nq = filter.query.toLowerCase();
          rows = rows.filter((m) => m.fullName.toLowerCase().includes(nq));
        }
        return rows;
      },
      async get(id) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('members').select('*').eq('id', id).maybeSingle();
        fail(error);
        return data ? memberFromRow(data as Row) : null;
      },
      async create(m) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('members').insert(memberToRow(m)).select().single();
        fail(error);
        return memberFromRow(data as Row);
      },
      async update(id, patch) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb
          .from('members')
          .update({ ...memberToRow(patch), updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        fail(error);
        return memberFromRow(data as Row);
      },
      async delete(id) {
        const sb = await getSupabaseClient();
        const { error } = await sb.from('members').delete().eq('id', id);
        fail(error);
      },
    },

    parentLinks: {
      async listByClan(clanId) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('parent_links').select('*').eq('clan_id', clanId);
        fail(error);
        return ((data as Row[]) ?? []).map(parentLinkFromRow);
      },
      async create(p) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('parent_links').insert(parentLinkToRow(p)).select().single();
        fail(error);
        return parentLinkFromRow(data as Row);
      },
      async delete(id) {
        const sb = await getSupabaseClient();
        const { error } = await sb.from('parent_links').delete().eq('id', id);
        fail(error);
      },
    },

    unions: {
      async listByClan(clanId) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('unions').select('*').eq('clan_id', clanId);
        fail(error);
        return ((data as Row[]) ?? []).map(unionFromRow);
      },
      async create(u) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('unions').insert(unionToRow(u)).select().single();
        fail(error);
        return unionFromRow(data as Row);
      },
      async update(id, patch) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('unions').update(unionToRow(patch)).eq('id', id).select().single();
        fail(error);
        return unionFromRow(data as Row);
      },
      async delete(id) {
        const sb = await getSupabaseClient();
        const { error } = await sb.from('unions').delete().eq('id', id);
        fail(error);
      },
    },

    branches: {
      async listByClan(clanId) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('branches').select('*').eq('clan_id', clanId);
        fail(error);
        return ((data as Row[]) ?? []).map(branchFromRow);
      },
      async create(b) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('branches').insert(branchToRow(b)).select().single();
        fail(error);
        return branchFromRow(data as Row);
      },
      async update(id, patch) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('branches').update(branchToRow(patch)).eq('id', id).select().single();
        fail(error);
        return branchFromRow(data as Row);
      },
      async delete(id) {
        const sb = await getSupabaseClient();
        const { error } = await sb.from('branches').delete().eq('id', id);
        fail(error);
      },
    },

    memberships: {
      async listByClan(clanId) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('memberships').select('*').eq('clan_id', clanId);
        fail(error);
        return ((data as Row[]) ?? []).map(membershipFromRow);
      },
      async myRole(clanId) {
        const sb = await getSupabaseClient();
        const { data: userRes } = await sb.auth.getUser();
        const user = userRes.user;
        if (!user) return null;
        const { data, error } = await sb
          .from('memberships')
          .select('role')
          .eq('clan_id', clanId)
          .eq('user_id', user.id)
          .maybeSingle();
        fail(error);
        return data ? ((data as Row).role as 'owner' | 'editor' | 'member') : null;
      },
    },

    invites: {
      async listByClan(clanId) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.from('invites').select('*').eq('clan_id', clanId);
        fail(error);
        return ((data as Row[]) ?? []).map(inviteFromRow);
      },
      async create(clanId, role, maxUses = null) {
        const sb = await getSupabaseClient();
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        const { data: userRes } = await sb.auth.getUser();
        const { data, error } = await sb
          .from('invites')
          .insert({ clan_id: clanId, code, role, max_uses: maxUses, created_by: userRes.user?.id })
          .select()
          .single();
        fail(error);
        return inviteFromRow(data as Row);
      },
      async redeem(code) {
        const sb = await getSupabaseClient();
        const { data, error } = await sb.rpc('redeem_invite', { p_code: code });
        fail(error);
        return membershipFromRow(data as Row);
      },
    },

    async snapshot(clanId: ID): Promise<ClanSnapshot> {
      const sb = await getSupabaseClient();
      const [c, m, p, u, b] = await Promise.all([
        sb.from('clans').select('*').eq('id', clanId).single(),
        sb.from('members').select('*').eq('clan_id', clanId),
        sb.from('parent_links').select('*').eq('clan_id', clanId),
        sb.from('unions').select('*').eq('clan_id', clanId),
        sb.from('branches').select('*').eq('clan_id', clanId),
      ]);
      fail(c.error);
      return {
        clan: clanFromRow(c.data as Row),
        members: ((m.data as Row[]) ?? []).map(memberFromRow),
        parentLinks: ((p.data as Row[]) ?? []).map(parentLinkFromRow),
        unions: ((u.data as Row[]) ?? []).map(unionFromRow),
        branches: ((b.data as Row[]) ?? []).map(branchFromRow),
      };
    },

    async importSnapshot(snap: ClanSnapshot): Promise<void> {
      const sb = await getSupabaseClient();
      await sb.from('clans').upsert({ id: snap.clan.id, ...clanToRow(snap.clan) });
      if (snap.branches.length)
        await sb.from('branches').upsert(snap.branches.map((b) => ({ id: b.id, ...branchToRow(b) })));
      if (snap.members.length)
        await sb.from('members').upsert(snap.members.map((m) => ({ id: m.id, ...memberToRow(m) })));
      if (snap.parentLinks.length)
        await sb.from('parent_links').upsert(snap.parentLinks.map((p) => ({ id: p.id, ...parentLinkToRow(p) })));
      if (snap.unions.length)
        await sb.from('unions').upsert(snap.unions.map((u) => ({ id: u.id, ...unionToRow(u) })));
    },
  };
}
