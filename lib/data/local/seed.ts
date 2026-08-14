// Seed dữ liệu demo lần đầu (local-first). Idempotent: chỉ ghi khi DB rỗng.

import { demoClanSnapshot } from '@/tests/fixtures/demoClan';
import type { DataRepository } from '../repository';

export async function seedIfEmpty(repo: DataRepository): Promise<void> {
  const clans = await repo.clans.list();
  if (clans.length > 0) return; // đã có dữ liệu → không đè
  await repo.importSnapshot(demoClanSnapshot());
}
