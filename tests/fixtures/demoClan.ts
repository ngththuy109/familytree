// ==========================================================================
// Dòng họ DEMO — dùng cho unit test (âm lịch, vai vế, ngày giỗ, thứ tự đời)
// và seed local-first. Cấu trúc đủ giàu:
//  - 4 đời; con trưởng/thứ (siblingOrder) → test Bác/Chú.
//  - Nhánh nội (qua cha) và ngoại (qua mẹ) → test O/Cậu.
//  - 1 người 2 đời vợ (An) → test nhiều Union.
//  - 1 con nuôi (Dũng) → test kind='adopted'.
//  - Ngày mất ÂM lịch (Cả, Nhất, An) → test ngày giỗ.
//  - region='trung' → danh xưng miền Trung (O, cố).
// ==========================================================================

import type {
  Branch,
  Clan,
  ClanSnapshot,
  DualDate,
  Gender,
  ID,
  Member,
  ParentKind,
  ParentLink,
  ParentRole,
  Union,
  UnionStatus,
} from '@/lib/domain/types';

const TS = '2026-01-01T00:00:00.000Z';
export const DEMO_CLAN_ID = 'clan-demo';

function solar(year: number, month: number, day: number): DualDate {
  return { source: 'solar', solar: { year, month, day }, lunar: null, precision: 'day' };
}
function lunar(year: number, month: number, day: number, isLeapMonth = false): DualDate {
  return { source: 'lunar', solar: null, lunar: { year, month, day, isLeapMonth }, precision: 'day' };
}

function mem(
  base: { id: ID; fullName: string; gender: Gender } & Partial<Member>
): Member {
  return {
    id: base.id,
    clanId: base.clanId ?? DEMO_CLAN_ID,
    branchId: base.branchId ?? null,
    fullName: base.fullName,
    familyName: base.familyName,
    givenName: base.givenName,
    tenTu: base.tenTu,
    tenHieu: base.tenHieu,
    otherNames: base.otherNames,
    gender: base.gender,
    isAlive: base.isAlive ?? true,
    birth: base.birth ?? null,
    death: base.death ?? null,
    restingPlace: base.restingPlace ?? null,
    photoUrl: base.photoUrl ?? null,
    biography: base.biography ?? null,
    achievements: base.achievements ?? null,
    siblingOrder: base.siblingOrder ?? null,
    generation: base.generation ?? null,
    note: base.note ?? null,
    createdAt: base.createdAt ?? TS,
    updatedAt: base.updatedAt ?? TS,
  };
}

function pl(
  id: ID,
  parentId: ID,
  childId: ID,
  role: ParentRole,
  kind: ParentKind = 'biological',
  unionId: ID | null = null
): ParentLink {
  return { id, clanId: DEMO_CLAN_ID, parentId, childId, role, kind, unionId };
}

function union(
  id: ID,
  a: ID,
  b: ID,
  order: number,
  status: UnionStatus = 'married'
): Union {
  return {
    id,
    clanId: DEMO_CLAN_ID,
    partnerAId: a,
    partnerBId: b,
    status,
    order,
    startDate: null,
    endDate: null,
    note: null,
  };
}

// --- Chi / Phái ---
const branches: Branch[] = [
  { id: 'b-phai', clanId: DEMO_CLAN_ID, name: 'Phái Nguyễn Văn', kind: 'phai', parentBranchId: null, rootMemberId: 'm-ca', note: null },
  { id: 'b-chi-an', clanId: DEMO_CLAN_ID, name: 'Chi Trưởng (Ông An)', kind: 'chi', parentBranchId: 'b-phai', rootMemberId: 'm-an', note: null },
  { id: 'b-chi-cuong', clanId: DEMO_CLAN_ID, name: 'Chi Hai (Ông Cường)', kind: 'chi', parentBranchId: 'b-phai', rootMemberId: 'm-cuong', note: null },
];

// --- Thành viên ---
const members: Member[] = [
  // Đời 1 — thủy tổ
  mem({ id: 'm-ca', fullName: 'Nguyễn Văn Cả', familyName: 'Nguyễn', givenName: 'Cả', tenHieu: 'Phúc Đường', gender: 'male', isAlive: false, birth: solar(1910, 2, 3), death: lunar(1980, 7, 15), restingPlace: 'Nghĩa trang họ Nguyễn', generation: 1, branchId: 'b-phai', biography: 'Thủy tổ khai lập dòng họ.' }),
  mem({ id: 'm-nhat', fullName: 'Trần Thị Nhất', familyName: 'Trần', givenName: 'Nhất', gender: 'female', isAlive: false, birth: solar(1912, 5, 10), death: lunar(1978, 3, 20), generation: 1, branchId: 'b-phai' }),

  // Đời 2 — con của Cả & Nhất
  mem({ id: 'm-an', fullName: 'Nguyễn Văn An', familyName: 'Nguyễn', givenName: 'An', gender: 'male', isAlive: false, birth: solar(1940, 1, 10), death: lunar(2015, 11, 5), siblingOrder: 1, generation: 2, branchId: 'b-chi-an', achievements: 'Trưởng họ đời thứ hai.' }),
  mem({ id: 'm-binh', fullName: 'Nguyễn Thị Bình', familyName: 'Nguyễn', givenName: 'Bình', gender: 'female', birth: solar(1943, 6, 6), siblingOrder: 2, generation: 2, branchId: 'b-phai' }),
  mem({ id: 'm-hanh', fullName: 'Nguyễn Thị Hạnh', familyName: 'Nguyễn', givenName: 'Hạnh', gender: 'female', birth: solar(1945, 3, 3), siblingOrder: 3, generation: 2, branchId: 'b-phai' }),
  mem({ id: 'm-cuong', fullName: 'Nguyễn Văn Cường', familyName: 'Nguyễn', givenName: 'Cường', gender: 'male', birth: solar(1946, 9, 9), siblingOrder: 4, generation: 2, branchId: 'b-chi-cuong' }),
  mem({ id: 'm-dung', fullName: 'Nguyễn Văn Dũng', familyName: 'Nguyễn', givenName: 'Dũng', gender: 'male', birth: solar(1949, 4, 4), siblingOrder: 5, generation: 2, branchId: 'b-phai', note: 'Con nuôi.' }),

  // Dâu/rể đời 2 (người ngoài họ)
  mem({ id: 'm-hoa', fullName: 'Lê Thị Hoa', familyName: 'Lê', givenName: 'Hoa', gender: 'female', birth: solar(1944, 2, 2), note: 'Vợ cả ông An.' }),
  mem({ id: 'm-yen', fullName: 'Phạm Thị Yến', familyName: 'Phạm', givenName: 'Yến', gender: 'female', birth: solar(1950, 8, 8), note: 'Vợ hai ông An.' }),
  mem({ id: 'm-tai', fullName: 'Hoàng Văn Tài', familyName: 'Hoàng', givenName: 'Tài', gender: 'male', birth: solar(1941, 3, 3), note: 'Chồng bà Bình.' }),
  mem({ id: 'm-kim', fullName: 'Đỗ Thị Kim', familyName: 'Đỗ', givenName: 'Kim', gender: 'female', birth: solar(1948, 7, 7), note: 'Vợ ông Cường.' }),

  // Đời 3
  mem({ id: 'm-em', fullName: 'Nguyễn Văn Em', familyName: 'Nguyễn', givenName: 'Em', gender: 'male', birth: solar(1968, 5, 5), siblingOrder: 1, generation: 3, branchId: 'b-chi-an' }),
  mem({ id: 'm-giang', fullName: 'Nguyễn Thị Giang', familyName: 'Nguyễn', givenName: 'Giang', gender: 'female', birth: solar(1971, 10, 1), siblingOrder: 2, generation: 3, branchId: 'b-chi-an' }),
  mem({ id: 'm-phu', fullName: 'Nguyễn Văn Phú', familyName: 'Nguyễn', givenName: 'Phú', gender: 'male', birth: solar(1974, 12, 12), siblingOrder: 3, generation: 3, branchId: 'b-chi-an', note: 'Con bà Yến (vợ hai).' }),
  mem({ id: 'm-ha', fullName: 'Hoàng Thị Hà', familyName: 'Hoàng', givenName: 'Hà', gender: 'female', birth: solar(1970, 7, 7), siblingOrder: 1, generation: 3, branchId: 'b-phai', note: 'Con bà Bình (nhánh ngoại).' }),
  mem({ id: 'm-lan', fullName: 'Nguyễn Thị Lan', familyName: 'Nguyễn', givenName: 'Lan', gender: 'female', birth: solar(1972, 11, 11), siblingOrder: 1, generation: 3, branchId: 'b-chi-cuong' }),
  mem({ id: 'm-nga', fullName: 'Trần Thị Nga', familyName: 'Trần', givenName: 'Nga', gender: 'female', birth: solar(1970, 1, 1), note: 'Vợ ông Em.' }),

  // Đời 4
  mem({ id: 'm-khoi', fullName: 'Nguyễn Văn Khôi', familyName: 'Nguyễn', givenName: 'Khôi', gender: 'male', birth: solar(1995, 3, 15), siblingOrder: 1, generation: 4, branchId: 'b-chi-an' }),
];

// --- Hôn phối ---
const unions: Union[] = [
  union('u-ca-nhat', 'm-ca', 'm-nhat', 1),
  union('u-an-hoa', 'm-an', 'm-hoa', 1),
  union('u-an-yen', 'm-an', 'm-yen', 2),
  union('u-binh-tai', 'm-binh', 'm-tai', 1),
  union('u-cuong-kim', 'm-cuong', 'm-kim', 1),
  union('u-em-nga', 'm-em', 'm-nga', 1),
];

// --- Cạnh cha/mẹ → con ---
const parentLinks: ParentLink[] = [
  // đời 1 → đời 2
  pl('p-ca-an', 'm-ca', 'm-an', 'father', 'biological', 'u-ca-nhat'),
  pl('p-nhat-an', 'm-nhat', 'm-an', 'mother', 'biological', 'u-ca-nhat'),
  pl('p-ca-binh', 'm-ca', 'm-binh', 'father', 'biological', 'u-ca-nhat'),
  pl('p-nhat-binh', 'm-nhat', 'm-binh', 'mother', 'biological', 'u-ca-nhat'),
  pl('p-ca-hanh', 'm-ca', 'm-hanh', 'father', 'biological', 'u-ca-nhat'),
  pl('p-nhat-hanh', 'm-nhat', 'm-hanh', 'mother', 'biological', 'u-ca-nhat'),
  pl('p-ca-cuong', 'm-ca', 'm-cuong', 'father', 'biological', 'u-ca-nhat'),
  pl('p-nhat-cuong', 'm-nhat', 'm-cuong', 'mother', 'biological', 'u-ca-nhat'),
  pl('p-ca-dung', 'm-ca', 'm-dung', 'father', 'adopted', 'u-ca-nhat'),
  pl('p-nhat-dung', 'm-nhat', 'm-dung', 'mother', 'adopted', 'u-ca-nhat'),
  // An + Hoa → Em, Giang
  pl('p-an-em', 'm-an', 'm-em', 'father', 'biological', 'u-an-hoa'),
  pl('p-hoa-em', 'm-hoa', 'm-em', 'mother', 'biological', 'u-an-hoa'),
  pl('p-an-giang', 'm-an', 'm-giang', 'father', 'biological', 'u-an-hoa'),
  pl('p-hoa-giang', 'm-hoa', 'm-giang', 'mother', 'biological', 'u-an-hoa'),
  // An + Yến → Phú (con cùng cha khác mẹ)
  pl('p-an-phu', 'm-an', 'm-phu', 'father', 'biological', 'u-an-yen'),
  pl('p-yen-phu', 'm-yen', 'm-phu', 'mother', 'biological', 'u-an-yen'),
  // Bình + Tài → Hà (nhánh ngoại)
  pl('p-tai-ha', 'm-tai', 'm-ha', 'father', 'biological', 'u-binh-tai'),
  pl('p-binh-ha', 'm-binh', 'm-ha', 'mother', 'biological', 'u-binh-tai'),
  // Cường + Kim → Lan
  pl('p-cuong-lan', 'm-cuong', 'm-lan', 'father', 'biological', 'u-cuong-kim'),
  pl('p-kim-lan', 'm-kim', 'm-lan', 'mother', 'biological', 'u-cuong-kim'),
  // Em + Nga → Khôi (đời 4)
  pl('p-em-khoi', 'm-em', 'm-khoi', 'father', 'biological', 'u-em-nga'),
  pl('p-nga-khoi', 'm-nga', 'm-khoi', 'mother', 'biological', 'u-em-nga'),
];

const clan: Clan = {
  id: DEMO_CLAN_ID,
  name: 'Họ Nguyễn – Làng Demo',
  description: 'Dòng họ mẫu để trải nghiệm ứng dụng.',
  founderMemberId: 'm-ca',
  coverImageUrl: null,
  settings: { region: 'trung', timezoneOffset: 7, remindLeadDays: 7 },
  createdBy: 'system',
  createdAt: TS,
  updatedAt: TS,
};

/** Snapshot demo dùng chung cho test và seed local. */
export function demoClanSnapshot(): ClanSnapshot {
  // Trả bản sao sâu để test/seed không đột biến dữ liệu gốc.
  return structuredClone({ clan, members, parentLinks, unions, branches });
}

export const demoClan: ClanSnapshot = { clan, members, parentLinks, unions, branches };
