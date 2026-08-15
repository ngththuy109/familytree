// Bảng chọn danh xưng theo cấu trúc quan hệ + vùng miền.
// MẶC ĐỊNH miền Trung: chị/em gái của cha = "O"; đời +3 = "Cố".
// Danh xưng do code tính (CONVENTIONS §4) — không nằm trong i18n.

import type { Gender, Region } from '@/lib/domain/types';

export type Side = 'noi' | 'ngoai' | null;

export interface TermInput {
  L: number; // dS - dT: target ở trên speaker L đời (âm = dưới)
  dS: number; // speaker → LCA
  dT: number; // target → LCA
  side: Side; // bên của speaker khi lên LCA
  targetGender: Gender;
  /** target (hoặc nhánh của target) có vai lớn hơn nhánh speaker không? */
  seniorTarget: boolean | null;
  targetGeneration: number | null;
  region: Region;
}

export interface TermResult {
  term: string;
  description: string;
  confidence: 'exact' | 'fallback';
}

const isMale = (g: Gender) => g === 'male';
const isFemale = (g: Gender) => g === 'female';

const LINEAL_DOWN = ['Con', 'Cháu', 'Chắt', 'Chút'];

/** Danh xưng huyết thống mà speaker dùng để gọi target. */
export function selectBloodTerm(i: TermInput): TermResult {
  const { L, region } = i;
  const male = isMale(i.targetGender);
  const female = isFemale(i.targetGender);
  const exact = (term: string, description = ''): TermResult => ({ term, description, confidence: 'exact' });
  const fb = (term: string, description = ''): TermResult => ({ term, description, confidence: 'fallback' });
  const genLabel = i.targetGeneration != null ? `đời ${i.targetGeneration}` : 'đời xa';

  // --- Trực hệ: target là tổ tiên (dT === 0) ---
  if (i.dT === 0 && L > 0) {
    switch (L) {
      case 1:
        return male
          ? exact(region === 'bac' ? 'Bố' : 'Ba', 'cha')
          : exact(region === 'nam' ? 'Má' : 'Mẹ', 'mẹ');
      case 2: {
        const sideWord = i.side === 'noi' ? ' nội' : i.side === 'ngoai' ? ' ngoại' : '';
        return male ? exact(`Ông${sideWord}`, 'ông') : exact(`Bà${sideWord}`, 'bà');
      }
      case 3:
        return exact(region === 'bac' ? 'Cụ' : 'Cố', 'cụ (đời +3)');
      case 4:
        return exact(region === 'bac' ? 'Kỵ' : 'Cụ', 'kỵ (đời +4)');
      default:
        return fb(`Tổ ${genLabel}`, 'tổ tiên xa');
    }
  }

  // --- Trực hệ: target là hậu duệ (dS === 0) ---
  if (i.dS === 0 && L < 0) {
    const k = -L;
    const t = LINEAL_DOWN[k - 1];
    return t ? exact(t, 'hậu duệ trực hệ') : fb(`Hậu duệ ${genLabel}`, 'hậu duệ xa');
  }

  // --- Bàng hệ ---
  const senior = i.seniorTarget === true;

  if (L === 0) {
    const suffix = i.dS >= 2 ? ' họ' : '';
    if (senior) {
      const t = male ? 'Anh' : female ? 'Chị' : 'Anh/Chị';
      return exact(`${t}${suffix}`.trim(), i.dS >= 2 ? 'anh/chị họ' : 'anh/chị ruột');
    }
    return exact(`Em${suffix}`.trim(), i.dS >= 2 ? 'em họ' : 'em ruột');
  }

  if (L === 1) {
    // Anh/chị/em của cha/mẹ
    if (i.side === 'noi') {
      if (male) return exact(senior ? 'Bác' : 'Chú', senior ? 'anh trai của cha' : 'em trai của cha');
      if (female) return exact(region === 'trung' ? 'O' : 'Cô', 'chị/em gái của cha');
      return fb(senior ? 'Bác' : 'Chú', 'anh/em của cha');
    }
    if (i.side === 'ngoai') {
      if (male) return exact('Cậu', 'anh/em trai của mẹ');
      if (female) return exact('Dì', 'chị/em gái của mẹ');
      return fb('Cậu/Dì', 'anh/em của mẹ');
    }
    return fb(male ? 'Bác/Chú' : 'Cô/Dì', 'vai trên một đời');
  }

  if (L === 2) {
    const sideWord = i.side === 'ngoai' ? ' (ngoại)' : '';
    return male ? exact(`Ông${sideWord}`, 'ông (vai trên 2 đời)') : exact(`Bà${sideWord}`, 'bà (vai trên 2 đời)');
  }

  if (L === 3) {
    return exact(region === 'bac' ? 'Cụ' : 'Cố', 'vai trên 3 đời');
  }

  if (L >= 4) {
    return fb(`Bậc trên, ${genLabel}`, 'vai trên nhiều đời');
  }

  // L < 0 bàng hệ: target là vai dưới
  if (L === -1) return exact('Cháu', 'cháu (con của anh/chị/em)');
  if (L === -2) return exact('Cháu', 'cháu (vai dưới 2 đời)');
  return fb(`Con cháu, ${genLabel}`, 'vai dưới nhiều đời');
}

/**
 * Ánh xạ danh xưng THÔNG GIA: target là vợ/chồng của người mà speaker gọi bằng
 * `baseTerm`. Hỗ trợ một phần (Giai đoạn 1) — phần đầy đủ để Giai đoạn 2.
 */
export function inLawTerm(baseTerm: string, targetGender: Gender): TermResult {
  const male = isMale(targetGender);
  const map: Record<string, string> = male
    ? { O: 'Dượng', Cô: 'Dượng', Dì: 'Dượng', Chị: 'Anh rể', Em: 'Em rể', Bà: 'Ông' }
    : {
        Bác: 'Bác gái',
        Chú: 'Thím',
        Cậu: 'Mợ',
        Anh: 'Chị dâu',
        Em: 'Em dâu',
        Ông: 'Bà',
      };
  const base = baseTerm.split(' ')[0] ?? baseTerm;
  const mapped = map[base];
  if (mapped) return { term: mapped, description: `thông gia (vợ/chồng của ${baseTerm})`, confidence: 'fallback' };
  return { term: `${baseTerm} (thông gia)`, description: 'quan hệ thông gia', confidence: 'fallback' };
}
