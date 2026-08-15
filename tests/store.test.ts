import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/lib/store/useAppStore';
import { t } from '@/lib/i18n';

beforeEach(() => {
  useAppStore.setState({ elderlyMode: false, regionOverride: null, selfMemberId: null });
});

describe('store', () => {
  it('toggleElderly đổi cờ elderlyMode', () => {
    expect(useAppStore.getState().elderlyMode).toBe(false);
    useAppStore.getState().toggleElderly();
    expect(useAppStore.getState().elderlyMode).toBe(true);
  });

  it('setRegionOverride và setSelf lưu giá trị', () => {
    useAppStore.getState().setRegionOverride('bac');
    useAppStore.getState().setSelf('m-em');
    expect(useAppStore.getState().regionOverride).toBe('bac');
    expect(useAppStore.getState().selfMemberId).toBe('m-em');
  });
});

describe('i18n', () => {
  it('t trả chuỗi vi cho khóa tồn tại; trả khóa khi thiếu', () => {
    expect(t('nav.tree')).toBe('Cây');
    expect(t('khong.ton.tai')).toBe('khong.ton.tai');
  });

  it('t nội suy biến {n}', () => {
    expect(t('gio.daysUntil', { n: 5 })).toContain('5');
  });
});
