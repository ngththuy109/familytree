import type { ClanSnapshot } from '@/lib/domain/types';
import { EXPORT_VERSION } from './toJson';

/** Đọc & kiểm tra chuỗi JSON đã xuất; trả về ClanSnapshot hợp lệ hoặc ném lỗi rõ. */
export function fromJson(text: string): ClanSnapshot {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Tệp JSON không hợp lệ.');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Tệp JSON không hợp lệ.');
  }
  const data = parsed as Record<string, unknown>;
  if (data.version !== EXPORT_VERSION) {
    throw new Error(`Phiên bản dữ liệu không tương thích (cần v${EXPORT_VERSION}).`);
  }
  const { clan, members, parentLinks, unions, branches } = data;
  if (
    !clan ||
    typeof clan !== 'object' ||
    !Array.isArray(members) ||
    !Array.isArray(parentLinks) ||
    !Array.isArray(unions) ||
    !Array.isArray(branches)
  ) {
    throw new Error('Thiếu trường bắt buộc (clan/members/parentLinks/unions/branches).');
  }
  const ids = new Set((members as Array<{ id?: string }>).map((m) => m.id));
  for (const p of parentLinks as Array<{ parentId?: string; childId?: string }>) {
    if (!ids.has(p.parentId) || !ids.has(p.childId)) {
      throw new Error('Dữ liệu hỏng: quan hệ cha/mẹ trỏ tới thành viên không tồn tại.');
    }
  }
  return { clan, members, parentLinks, unions, branches } as ClanSnapshot;
}
