// Interface truy cập dữ liệu — UI chỉ phụ thuộc file này (qua getRepository()).
// Hai hiện thực: local (IndexedDB) và supabase.

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

export interface DataRepository {
  clans: {
    list(): Promise<Clan[]>;
    get(id: ID): Promise<Clan | null>;
    create(c: NewClan): Promise<Clan>;
    update(id: ID, patch: Partial<Clan>): Promise<Clan>;
  };
  members: {
    listByClan(clanId: ID, filter?: MemberFilter): Promise<Member[]>;
    get(id: ID): Promise<Member | null>;
    create(m: NewMember): Promise<Member>;
    update(id: ID, patch: Partial<Member>): Promise<Member>;
    delete(id: ID): Promise<void>;
  };
  parentLinks: {
    listByClan(clanId: ID): Promise<ParentLink[]>;
    create(p: NewParentLink): Promise<ParentLink>;
    delete(id: ID): Promise<void>;
  };
  unions: {
    listByClan(clanId: ID): Promise<Union[]>;
    create(u: NewUnion): Promise<Union>;
    update(id: ID, patch: Partial<Union>): Promise<Union>;
    delete(id: ID): Promise<void>;
  };
  branches: {
    listByClan(clanId: ID): Promise<Branch[]>;
    create(b: NewBranch): Promise<Branch>;
    update(id: ID, patch: Partial<Branch>): Promise<Branch>;
    delete(id: ID): Promise<void>;
  };
  memberships: {
    listByClan(clanId: ID): Promise<Membership[]>;
    myRole(clanId: ID): Promise<Role | null>;
  };
  invites: {
    listByClan(clanId: ID): Promise<Invite[]>;
    create(clanId: ID, role: Role, maxUses?: number | null): Promise<Invite>;
    redeem(code: string): Promise<Membership>;
  };
  /** Nạp toàn bộ dữ liệu 1 dòng họ (trục tính toán). */
  snapshot(clanId: ID): Promise<ClanSnapshot>;
  /** Ghi cả snapshot (dùng cho seed và nhập JSON). Ghi đè theo id. */
  importSnapshot(snapshot: ClanSnapshot): Promise<void>;
}
