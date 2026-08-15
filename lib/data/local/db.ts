// Mở IndexedDB cho bản local-first (dùng thư viện `idb`).

import { openDB, type IDBPDatabase } from 'idb';

export const DB_NAME = 'giaphaviet';
export const DB_VERSION = 1;

export const STORES = [
  'clans',
  'members',
  'parentLinks',
  'unions',
  'branches',
  'memberships',
  'invites',
] as const;

export type StoreName = (typeof STORES)[number];

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB không khả dụng (chỉ chạy phía trình duyệt).');
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const s of STORES) {
          if (!db.objectStoreNames.contains(s)) {
            const store = db.createObjectStore(s, { keyPath: 'id' });
            if (s !== 'clans') store.createIndex('clanId', 'clanId');
          }
        }
      },
    });
  }
  return dbPromise;
}

/** Chỉ dùng cho test: quên instance đã cache để mở lại DB (mới). */
export function resetDBCache(): void {
  dbPromise = null;
}
