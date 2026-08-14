import { describe, it, expect } from 'vitest';
import { normalize, matchesQuery } from '@/lib/search/normalize';

describe('search normalize', () => {
  it('bỏ dấu tiếng Việt và đ→d', () => {
    expect(normalize('Nguyễn Đức')).toBe('nguyen duc');
    expect(normalize('CẦU')).toBe('cau');
  });

  it('matchesQuery tìm được khi gõ không dấu', () => {
    expect(matchesQuery('Nguyễn Văn Cầu', 'cau')).toBe(true);
    expect(matchesQuery('Trần Thị Nhất', 'nhat')).toBe(true);
    expect(matchesQuery('Nguyễn', 'le')).toBe(false);
  });

  it('query rỗng khớp mọi thứ', () => {
    expect(matchesQuery('bất kỳ', '')).toBe(true);
  });
});
