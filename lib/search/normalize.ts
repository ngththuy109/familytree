// Chuẩn hóa chuỗi để tìm kiếm không dấu (NFD + bỏ dấu + đ→d).

const COMBINING_MARKS = /[̀-ͯ]/g;

export function normalize(s: string): string {
  return s.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replace(/đ/g, 'd');
}

export function matchesQuery(text: string, query: string): boolean {
  const q = normalize(query).trim();
  if (!q) return true;
  return normalize(text).includes(q);
}
