import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, it, expect } from 'vitest';
import { createLocalRepository } from '@/lib/data/local/localRepository';
import { seedIfEmpty } from '@/lib/data/local/seed';
import { resetDBCache } from '@/lib/data/local/db';
import { getRepository, isSupabaseConfigured, __resetRepositoryCache } from '@/lib/data';
import { DEMO_CLAN_ID } from '@/tests/fixtures/demoClan';
import type { NewMember } from '@/lib/domain/types';

const baseNewMember: NewMember = {
  clanId: DEMO_CLAN_ID,
  branchId: null,
  fullName: 'Người Mới',
  gender: 'male',
  isAlive: true,
  birth: null,
  death: null,
  restingPlace: null,
  photoUrl: null,
  biography: null,
  achievements: null,
  siblingOrder: null,
  generation: null,
  note: null,
};

beforeEach(() => {
  (globalThis as unknown as { indexedDB: IDBFactory }).indexedDB = new IDBFactory();
  resetDBCache();
  __resetRepositoryCache();
});

describe('local repository (IndexedDB)', () => {
  it('seed rồi snapshot(demoClanId) trả đủ members/parentLinks/unions', async () => {
    const repo = createLocalRepository();
    await seedIfEmpty(repo);
    const snap = await repo.snapshot(DEMO_CLAN_ID);
    expect(snap.members.length).toBeGreaterThan(10);
    expect(snap.parentLinks.length).toBeGreaterThan(0);
    expect(snap.unions.length).toBeGreaterThan(0);
  });

  it('createMember rồi getMember trả đúng bản ghi', async () => {
    const repo = createLocalRepository();
    await seedIfEmpty(repo);
    const created = await repo.members.create(baseNewMember);
    const got = await repo.members.get(created.id);
    expect(got?.fullName).toBe('Người Mới');
    expect(got?.id).toBe(created.id);
  });

  it('updateMember đổi field + updatedAt; deleteMember xóa khỏi snapshot', async () => {
    const repo = createLocalRepository();
    await seedIfEmpty(repo);
    const before = await repo.members.get('m-em');
    const upd = await repo.members.update('m-em', { biography: 'Tiểu sử mới' });
    expect(upd.biography).toBe('Tiểu sử mới');
    expect(upd.updatedAt).not.toBe(before?.updatedAt);

    await repo.members.delete('m-em');
    const snap = await repo.snapshot(DEMO_CLAN_ID);
    expect(snap.members.find((m) => m.id === 'm-em')).toBeUndefined();
  });

  it('seed idempotent: gọi 2 lần không nhân đôi dữ liệu', async () => {
    const repo = createLocalRepository();
    await seedIfEmpty(repo);
    const n1 = (await repo.snapshot(DEMO_CLAN_ID)).members.length;
    await seedIfEmpty(repo);
    const n2 = (await repo.snapshot(DEMO_CLAN_ID)).members.length;
    expect(n2).toBe(n1);
  });

  it('getRepository() trả Local khi thiếu NEXT_PUBLIC_SUPABASE_URL', () => {
    expect(isSupabaseConfigured()).toBe(false);
    const r = getRepository();
    expect(typeof r.snapshot).toBe('function');
    expect(typeof r.members.create).toBe('function');
  });
});
