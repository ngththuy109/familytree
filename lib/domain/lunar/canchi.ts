// Can-Chi (thiên can - địa chi) cho năm/ngày Âm lịch + tên tháng.

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;
const MONTH_NAMES = [
  'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Một', 'Chạp',
] as const;

const mod = (n: number, m: number): number => ((n % m) + m) % m;

/** Can-Chi của năm âm, ví dụ 2024 → "Giáp Thìn". */
export function canChiOfYear(year: number): string {
  return `${CAN[mod(year + 6, 10)] ?? ''} ${CHI[mod(year + 8, 12)] ?? ''}`;
}

/** Can-Chi của ngày theo Julian day number. */
export function canChiOfDay(jd: number): string {
  return `${CAN[mod(jd + 9, 10)] ?? ''} ${CHI[mod(jd + 1, 12)] ?? ''}`;
}

/** Tên tháng âm: 1 → "Giêng", 11 → "Một", 12 → "Chạp". */
export function lunarMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}
