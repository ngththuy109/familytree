// ==========================================================================
// Kiểu dữ liệu domain — nguồn sự thật cho mọi tầng.
// Nguyên tắc (xem docs/tasks/CONVENTIONS.md §3):
//  - Quan hệ là CẠNH: ParentLink (cha/mẹ→con) + Union (hôn phối), không mảng lồng.
//  - Ngày = DualDate (âm + dương, cờ `source`).
//  - `generation` (đời) là GIÁ TRỊ TÍNH TOÁN (cache), không phải nguồn sự thật.
//  - Bên nội/ngoại KHÔNG lưu — do lib/domain/kinship tính.
// File này thuần TypeScript: KHÔNG import React/DOM.
// ==========================================================================

export type ID = string;

export type Gender = 'male' | 'female' | 'other' | 'unknown';

/** Ngày Dương lịch (tháng/ngày 1-based). */
export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

/** Ngày Âm lịch (kèm cờ tháng nhuận). */
export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}

export type DatePrecision = 'day' | 'month' | 'year' | 'unknown';

/**
 * Ngày kép: giữ cả Âm và Dương. `source` = loại người dùng nhập; loại kia được
 * suy ra bằng lib/domain/lunar. `circa` = "khoảng".
 */
export interface DualDate {
  source: 'solar' | 'lunar';
  solar: SolarDate | null;
  lunar: LunarDate | null;
  precision: DatePrecision;
  circa?: boolean;
}

/** Một người trong gia phả. */
export interface Member {
  id: ID;
  clanId: ID;
  branchId: ID | null; // Chi/Phái (tùy chọn)
  // Tên
  fullName: string; // họ và tên
  familyName?: string; // họ (để sắp/tìm)
  givenName?: string; // tên
  tenTu?: string; // tên tự
  tenHieu?: string; // tên hiệu
  otherNames?: string[]; // biệt danh / tên thường gọi
  gender: Gender;
  // Trạng thái sống
  isAlive: boolean;
  birth: DualDate | null;
  death: DualDate | null;
  restingPlace: string | null; // nơi an nghỉ
  // Mô tả
  photoUrl: string | null;
  biography: string | null; // tiểu sử
  achievements: string | null; // thành tựu
  // Sắp xếp / cache (tính toán, denormalized)
  siblingOrder: number | null; // con trưởng = 1, con thứ = 2…
  generation: number | null; // đời thứ N (cache; tính lại khi ghi)
  // Khác
  note: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ParentRole = 'father' | 'mother' | 'parent';
export type ParentKind = 'biological' | 'adopted' | 'step' | 'foster';

/** Cạnh cha/mẹ → con. Một người con thường có 2 cạnh (cha + mẹ). */
export interface ParentLink {
  id: ID;
  clanId: ID;
  parentId: ID;
  childId: ID;
  role: ParentRole;
  kind: ParentKind; // con ruột / con nuôi / con riêng / con đỡ đầu
  unionId: ID | null; // thuộc hôn phối nào (nếu biết)
}

export type UnionStatus = 'married' | 'divorced' | 'widowed' | 'partner' | 'unknown';

/** Hôn phối — nhiều dòng/người theo thời gian (nhiều đời vợ/chồng). */
export interface Union {
  id: ID;
  clanId: ID;
  partnerAId: ID;
  partnerBId: ID;
  status: UnionStatus;
  order: number | null; // vợ cả = 1, vợ hai = 2 (theo từng người)
  startDate: DualDate | null;
  endDate: DualDate | null;
  note: string | null;
}

export type BranchKind = 'phai' | 'chi' | 'nhanh' | 'other';

/** Chi / Phái / Nhánh — phân cấp. */
export interface Branch {
  id: ID;
  clanId: ID;
  name: string;
  kind: BranchKind;
  parentBranchId: ID | null; // Phái ⊃ Chi ⊃ Nhánh
  rootMemberId: ID | null; // tổ của chi/phái
  note: string | null;
}

export type Region = 'bac' | 'trung' | 'nam';

export interface ClanSettings {
  region: Region; // quy ước danh xưng theo vùng (mặc định 'trung')
  timezoneOffset: number; // múi giờ âm lịch (mặc định 7)
  remindLeadDays?: number; // cửa sổ nhắc giỗ (mặc định 7)
}

/** Dòng họ (cây gia phả). */
export interface Clan {
  id: ID;
  name: string; // "Họ Nguyễn – Làng …"
  description: string | null;
  founderMemberId: ID | null; // thủy tổ (đời 1)
  coverImageUrl: string | null;
  settings: ClanSettings;
  createdBy: ID;
  createdAt: string;
  updatedAt: string;
}

export type Role = 'owner' | 'editor' | 'member';

export interface Membership {
  id: ID;
  clanId: ID;
  userId: ID;
  role: Role;
  linkedMemberId: ID | null; // "tôi là ai trong cây"
  createdAt: string;
}

export interface Invite {
  id: ID;
  clanId: ID;
  code: string; // mã mời ngắn, dễ đọc
  role: Role; // vai trò khi redeem
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  revoked: boolean;
  createdBy: ID;
  createdAt: string;
}

/** Toàn bộ dữ liệu 1 dòng họ, nạp một lần để tính toán trong bộ nhớ. */
export interface ClanSnapshot {
  clan: Clan;
  members: Member[];
  parentLinks: ParentLink[];
  unions: Union[];
  branches: Branch[];
}

// --- Kiểu cho thao tác tạo mới (bỏ id/thời gian do tầng data sinh) ---
export type NewMember = Omit<Member, 'id' | 'createdAt' | 'updatedAt'>;
export type NewUnion = Omit<Union, 'id'>;
export type NewParentLink = Omit<ParentLink, 'id'>;
export type NewBranch = Omit<Branch, 'id'>;
export type NewClan = Omit<Clan, 'id' | 'createdAt' | 'updatedAt'>;

/** Bộ lọc thành viên (tìm kiếm/lọc). */
export interface MemberFilter {
  query?: string; // tên (khử dấu)
  generation?: number;
  branchId?: ID;
  aliveOnly?: boolean;
}
