import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '@/app/page';

describe('smoke — trang chủ', () => {
  it('render tên "Gia Phả Việt"', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Gia Phả Việt/i).length).toBeGreaterThan(0);
  });

  it('có nút xem gia phả demo', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /Xem gia phả demo/i })).toBeInTheDocument();
  });
});
