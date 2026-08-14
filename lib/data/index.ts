// Factory chọn hiện thực repository theo môi trường.
//  - Có NEXT_PUBLIC_SUPABASE_URL  → Supabase (bổ sung ở T-17).
//  - Ngược lại                    → Local (IndexedDB) + seed demo.
// Phần còn lại của app chỉ import getRepository()/ensureSeeded() từ đây.

import { createLocalRepository } from './local/localRepository';
import { seedIfEmpty } from './local/seed';
import type { DataRepository } from './repository';

let cached: DataRepository | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getRepository(): DataRepository {
  if (cached) return cached;
  // TODO(T-17): if (isSupabaseConfigured()) cached = createSupabaseRepository();
  cached = createLocalRepository();
  return cached;
}

/** Gọi khi khởi động app: seed dữ liệu demo cho bản local. */
export async function ensureSeeded(): Promise<void> {
  if (!isSupabaseConfigured()) {
    await seedIfEmpty(getRepository());
  }
}

/** Chỉ dùng cho test. */
export function __resetRepositoryCache(): void {
  cached = null;
}

export { DEMO_CLAN_ID } from '@/tests/fixtures/demoClan';
export type { DataRepository } from './repository';
