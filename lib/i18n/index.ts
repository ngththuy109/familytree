import { vi } from './vi';

function lookup(path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined),
      vi
    );
}

/** Lấy chuỗi tiếng Việt theo khóa "a.b.c"; nội suy {var}. Thiếu khóa → trả khóa. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const found = lookup(key);
  let str = typeof found === 'string' ? found : key;
  if (vars) {
    for (const [k, val] of Object.entries(vars)) {
      str = str.split(`{${k}}`).join(String(val));
    }
  }
  return str;
}

export { vi };
export type { Messages } from './vi';
