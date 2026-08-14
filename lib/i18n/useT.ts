'use client';

import { t } from './index';

/** Hook i18n. Hiện chỉ có tiếng Việt; cấu trúc để mở rộng locale sau. */
export function useT() {
  return t;
}
