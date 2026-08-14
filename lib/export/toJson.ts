import type { ClanSnapshot } from '@/lib/domain/types';

export const EXPORT_VERSION = 1;

export interface ExportFile extends ClanSnapshot {
  version: number;
  app: 'gia-pha-viet';
  exportedContext?: string;
}

/** Xuất toàn bộ dòng họ ra chuỗi JSON (có version để nhập lại an toàn). */
export function toJson(snapshot: ClanSnapshot): string {
  const data: ExportFile = { version: EXPORT_VERSION, app: 'gia-pha-viet', ...snapshot };
  return JSON.stringify(data, null, 2);
}
