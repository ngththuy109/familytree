'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Trang chủ', icon: '🏠' },
  { href: '/cay', label: 'Cây', icon: '🌳' },
  { href: '/danh-sach', label: 'Danh sách', icon: '📋' },
  { href: '/gio', label: 'Giỗ', icon: '🕯️' },
  { href: '/tim-kiem', label: 'Tìm', icon: '🔎' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur"
    >
      <ul className="mx-auto flex w-full max-w-2xl">
        {items.map((it) => {
          const active = it.href === '/' ? pathname === '/' : pathname.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
                  active ? 'text-primary' : 'text-muted'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span aria-hidden className="text-lg">
                  {it.icon}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
